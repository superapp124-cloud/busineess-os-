package com.chatr.app.ondeviceai

import android.content.Context
import android.os.StatFs
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.security.MessageDigest

class ModelDownloadWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    companion object {
        const val KEY_MODEL_URL = "model_url"
        const val KEY_EXPECTED_SHA256 = "expected_sha256"
        const val KEY_FILENAME = "filename"
        const val KEY_TARGET_DIR = "target_dir"

        // Verified from HuggingFace LFS API 2026-09-28
        // File: qwen2.5-0.5b-instruct-q4_k_m.gguf
        // LFS SHA-256 (content hash): 74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db
        // Exact size: 491,400,032 bytes
        const val DEFAULT_MODEL_URL = "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf"
        const val DEFAULT_FILENAME = "chatr-local-0.5b-v1.gguf"
        const val DEFAULT_TARGET_DIR = "models"
        const val DEFAULT_EXPECTED_SHA256 = "74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db"
        const val EXPECTED_FILE_SIZE_BYTES = 491_400_032L

        private const val REQUIRED_DISK_SPACE_BYTES = 1000L * 1024 * 1024 // 1GB safety check
        private const val TAG = "ModelDownloadWorker"

        internal fun validateChecksum(file: File, expectedHash: String): Boolean {
            if (expectedHash.isBlank() || expectedHash.startsWith("EXPECTED_")) {
                Log.w(TAG, "Checksum validation bypassed for development hash.")
                return true
            }

            return try {
                val digest = MessageDigest.getInstance("SHA-256")
                file.inputStream().use {
                    val buffer = ByteArray(32768)
                    var bytesRead: Int
                    while (it.read(buffer).also { read -> bytesRead = read } != -1) {
                        digest.update(buffer, 0, bytesRead)
                    }
                }
                val actualHash = digest.digest().joinToString("") { "%02x".format(it) }
                actualHash.equals(expectedHash, ignoreCase = true)
            } catch (e: Exception) {
                Log.e(TAG, "Error calculating checksum", e)
                false
            }
        }
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val modelUrl = inputData.getString(KEY_MODEL_URL) ?: DEFAULT_MODEL_URL
        val expectedSha = inputData.getString(KEY_EXPECTED_SHA256) ?: DEFAULT_EXPECTED_SHA256
        val filename = inputData.getString(KEY_FILENAME) ?: DEFAULT_FILENAME
        val targetDirName = inputData.getString(KEY_TARGET_DIR) ?: DEFAULT_TARGET_DIR

        val modelsDir = File(context.filesDir, targetDirName)
        if (!modelsDir.exists()) modelsDir.mkdirs()

        val finalFile = File(modelsDir, filename)
        val tmpFile = File(modelsDir, "$filename.tmp")

        if (finalFile.exists() && finalFile.length() > 100_000_000) {
            Log.i(TAG, "Model file already exists: ${finalFile.absolutePath}")
            return@withContext Result.success()
        }

        // Storage Check
        val statFs = StatFs(modelsDir.path)
        val availableBytes = statFs.availableBlocksLong * statFs.blockSizeLong
        if (availableBytes < REQUIRED_DISK_SPACE_BYTES) {
            Log.e(TAG, "Insufficient disk space. Required: 1GB, Available: ${availableBytes / (1024 * 1024)}MB")
            return@withContext Result.failure(workDataOf("error" to "insufficient_storage"))
        }

        val downloadedBytes = if (tmpFile.exists()) tmpFile.length() else 0L

        val client = OkHttpClient.Builder().build()
        val requestBuilder = Request.Builder().url(modelUrl)

        if (downloadedBytes > 0) {
            requestBuilder.addHeader("Range", "bytes=$downloadedBytes-")
        }

        try {
            val response = client.newCall(requestBuilder.build()).execute()

            if (!response.isSuccessful) {
                if (response.code == 416) {
                    tmpFile.delete()
                    return@withContext Result.retry()
                }
                Log.e(TAG, "Server returned HTTP ${response.code}")
                return@withContext Result.retry()
            }

            val isPartial = response.code == 206
            val append = isPartial && downloadedBytes > 0
            val body = response.body ?: return@withContext Result.retry()

            val contentLength = body.contentLength()
            val totalExpected = if (append) downloadedBytes + contentLength else contentLength

            saveToFileWithProgress(body.byteStream(), tmpFile, append, downloadedBytes, totalExpected)

            val checksumValid = validateChecksum(tmpFile, expectedSha)
            if (checksumValid) {
                if (tmpFile.renameTo(finalFile) || (tmpFile.copyTo(finalFile, overwrite = true).exists() && tmpFile.delete())) {
                    Log.i(TAG, "GGUF Model downloaded and verified successfully: ${finalFile.absolutePath}")
                    Result.success(workDataOf("path" to finalFile.absolutePath))
                } else {
                    Result.failure(workDataOf("error" to "rename_failed"))
                }
            } else {
                Log.e(TAG, "Checksum validation failed. Deleting corrupted file.")
                tmpFile.delete()
                Result.retry()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Download error", e)
            Result.retry()
        }
    }

    private suspend fun saveToFileWithProgress(
        inputStream: InputStream,
        file: File,
        append: Boolean,
        initialBytes: Long,
        totalBytes: Long
    ) {
        val outputStream = FileOutputStream(file, append)
        var currentBytes = initialBytes
        val buffer = ByteArray(65536)
        var lastReportTime = 0L

        inputStream.use { input ->
            outputStream.use { output ->
                var read: Int
                while (input.read(buffer).also { read = it } != -1) {
                    output.write(buffer, 0, read)
                    currentBytes += read

                    val now = System.currentTimeMillis()
                    if (now - lastReportTime > 500 && totalBytes > 0) {
                        val progress = ((currentBytes * 100) / totalBytes).toInt()
                        setProgressAsync(workDataOf(
                            "progress" to progress,
                            "downloaded" to currentBytes,
                            "total" to totalBytes
                        ))
                        lastReportTime = now
                    }
                }
            }
        }
    }
}
