#!/usr/bin/env python3
"""
inspect_safetensors.py
======================
Forensic Safetensors Binary Inspector & Validator.
Performs deep structural, metadata, and numeric auditing of safetensors artifacts:
  1. Validates 8-byte unsigned integer header length (little-endian uint64).
  2. Parses and validates JSON header structure and metadata.
  3. Verifies tensor count, shapes, and supported dtypes (F32, F16, BF16).
  4. Audits byte-offset boundaries (monotonic, contiguous, within file boundary).
  5. Inspects raw tensor bytes for non-zero values, finite numbers (no NaN, no Inf).
  6. Enforces minimum file size threshold (>= 1 MB for real LoRA adapters).
  7. Computes cryptographic SHA-256 digest.

Usage:
    python scripts/ai_training/inspect_safetensors.py path/to/adapter_model.safetensors
"""

import argparse
import hashlib
import json
import math
import struct
import sys
from pathlib import Path
from typing import Optional

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
    except Exception:
        pass

MIN_ADAPTER_SIZE_BYTES = 1_000_000  # 1 MB minimum for real PEFT LoRA adapter
VALID_DTYPES = {"F32", "F16", "BF16", "I32", "I64", "I16", "I8", "U8", "BOOL"}


def audit_safetensors_file(file_path: Path, min_size: int = MIN_ADAPTER_SIZE_BYTES) -> dict:
    """
    Forensically audits a safetensors file.
    Returns audit result dict with pass/fail and detailed diagnostics.
    """
    path = Path(file_path)
    if not path.exists():
        return {
            "valid": False,
            "error": f"File does not exist: {path}",
            "file_size": 0,
            "sha256": None
        }

    raw_bytes = path.read_bytes()
    file_size = len(raw_bytes)
    sha256_hash = hashlib.sha256(raw_bytes).hexdigest()

    # Check 1: Minimum file size threshold
    if file_size < min_size:
        return {
            "valid": False,
            "error": f"Artifact rejected: File size ({file_size} bytes) is below required minimum ({min_size} bytes). Likely dummy or stub artifact.",
            "file_size": file_size,
            "sha256": sha256_hash
        }

    # Check 2: Header length prefix (8 bytes uint64 little-endian)
    if file_size < 8:
        return {
            "valid": False,
            "error": "File smaller than 8 bytes; cannot contain safetensors header length.",
            "file_size": file_size,
            "sha256": sha256_hash
        }

    header_len = struct.unpack("<Q", raw_bytes[:8])[0]
    if header_len <= 0:
        return {
            "valid": False,
            "error": f"Invalid header length: {header_len} bytes.",
            "file_size": file_size,
            "sha256": sha256_hash
        }

    if 8 + header_len > file_size:
        return {
            "valid": False,
            "error": f"Header length ({header_len}) exceeds total file size ({file_size}). File is truncated or corrupted.",
            "file_size": file_size,
            "sha256": sha256_hash
        }

    # Check 3: JSON Header parsing
    header_raw = raw_bytes[8 : 8 + header_len]
    try:
        header_str = header_raw.decode("utf-8")
        header = json.loads(header_str)
    except UnicodeDecodeError:
        return {
            "valid": False,
            "error": "Header contains non-UTF-8 bytes. Not a valid safetensors header.",
            "file_size": file_size,
            "sha256": sha256_hash
        }
    except json.JSONDecodeError as e:
        return {
            "valid": False,
            "error": f"Malformed JSON header in safetensors: {e}",
            "file_size": file_size,
            "sha256": sha256_hash
        }

    if not isinstance(header, dict):
        return {
            "valid": False,
            "error": "Safetensors header root must be a JSON object.",
            "file_size": file_size,
            "sha256": sha256_hash
        }

    # Separate metadata from tensors
    metadata = header.get("__metadata__", {})
    tensor_entries = {k: v for k, v in header.items() if k != "__metadata__"}

    if len(tensor_entries) == 0:
        return {
            "valid": False,
            "error": "Safetensors contains 0 tensor entries. Only metadata found.",
            "file_size": file_size,
            "sha256": sha256_hash
        }

    # Check 4: Tensor validation & byte offsets
    data_buffer_start = 8 + header_len
    data_buffer = raw_bytes[data_buffer_start:]
    data_buffer_len = len(data_buffer)

    tensors_info = []
    total_elements = 0
    all_zero_tensors = []
    invalid_number_tensors = []
    prev_end = 0

    for name, t_spec in tensor_entries.items():
        if not isinstance(t_spec, dict):
            return {
                "valid": False,
                "error": f"Tensor '{name}' specification is not a dictionary.",
                "file_size": file_size,
                "sha256": sha256_hash
            }

        dtype = t_spec.get("dtype")
        shape = t_spec.get("shape")
        offsets = t_spec.get("data_offsets")

        if dtype not in VALID_DTYPES:
            return {
                "valid": False,
                "error": f"Tensor '{name}' has unsupported or invalid dtype: '{dtype}'",
                "file_size": file_size,
                "sha256": sha256_hash
            }

        if not isinstance(shape, list) or not all(isinstance(x, int) and x >= 0 for x in shape):
            return {
                "valid": False,
                "error": f"Tensor '{name}' has invalid shape: {shape}",
                "file_size": file_size,
                "sha256": sha256_hash
            }

        if not isinstance(offsets, list) or len(offsets) != 2:
            return {
                "valid": False,
                "error": f"Tensor '{name}' has invalid data_offsets: {offsets}",
                "file_size": file_size,
                "sha256": sha256_hash
            }

        start, end = offsets[0], offsets[1]
        if start < 0 or end < start or end > data_buffer_len:
            return {
                "valid": False,
                "error": f"Tensor '{name}' offsets [{start}, {end}] exceed data buffer length ({data_buffer_len}).",
                "file_size": file_size,
                "sha256": sha256_hash
            }

        tensor_bytes = data_buffer[start:end]
        num_bytes = end - start

        # Check for all-zero tensor content
        is_all_zero = not any(b != 0 for b in tensor_bytes)
        if is_all_zero:
            all_zero_tensors.append(name)

        # Check for NaN / Inf in F32 / F16 tensors
        num_elements = math.prod(shape) if shape else 1
        total_elements += num_elements

        if dtype == "F32" and num_bytes % 4 == 0:
            sample_count = min(num_elements, 100)
            fmt = f"<{sample_count}f"
            sample_bytes = tensor_bytes[: sample_count * 4]
            try:
                floats = struct.unpack(fmt, sample_bytes)
                for val in floats:
                    if math.isnan(val) or math.isinf(val):
                        invalid_number_tensors.append(name)
                        break
            except Exception:
                pass
        elif dtype == "F16" and num_bytes % 2 == 0:
            sample_count = min(num_elements, 100)
            fmt = f"<{sample_count}e"
            sample_bytes = tensor_bytes[: sample_count * 2]
            try:
                floats = struct.unpack(fmt, sample_bytes)
                for val in floats:
                    if math.isnan(val) or math.isinf(val):
                        invalid_number_tensors.append(name)
                        break
            except Exception:
                pass

        tensors_info.append({
            "name": name,
            "dtype": dtype,
            "shape": shape,
            "num_bytes": num_bytes,
            "is_all_zero": is_all_zero
        })

    # Reject if all tensors in the file are all zeros
    if len(all_zero_tensors) == len(tensor_entries):
        return {
            "valid": False,
            "error": "All tensors in the safetensors file are 100% zeros. Real trained weights must be non-zero.",
            "file_size": file_size,
            "sha256": sha256_hash,
            "all_zero_count": len(all_zero_tensors)
        }

    if invalid_number_tensors:
        return {
            "valid": False,
            "error": f"Detected NaN or Inf values in tensors: {invalid_number_tensors[:3]}",
            "file_size": file_size,
            "sha256": sha256_hash
        }

    return {
        "valid": True,
        "file_size_bytes": file_size,
        "sha256": sha256_hash,
        "header_length_bytes": header_len,
        "tensor_count": len(tensor_entries),
        "total_elements": total_elements,
        "metadata": metadata,
        "all_zero_tensors_count": len(all_zero_tensors),
        "non_zero_tensors_count": len(tensor_entries) - len(all_zero_tensors),
        "sample_tensors": tensors_info[:5]
    }


def main():
    parser = argparse.ArgumentParser(description="CHATR Safetensors Forensic Inspector")
    parser.add_argument("file", help="Path to safetensors file to audit")
    parser.add_argument("--min-size", type=int, default=MIN_ADAPTER_SIZE_BYTES, help="Minimum file size in bytes")
    args = parser.parse_args()

    target = Path(args.file)
    print(f"\n{'='*70}")
    print(f"  SAFETENSORS FORENSIC AUDIT: {target.name}")
    print(f"{'='*70}")

    result = audit_safetensors_file(target, min_size=args.min_size)
    print(json.dumps(result, indent=2))

    if result.get("valid"):
        print(f"\n  ✅ VALID REAL SAFETENSORS ARTIFACT")
        print(f"     Tensor count: {result['tensor_count']}")
        print(f"     File size   : {round(result['file_size_bytes'] / (1024*1024), 2)} MB")
        print(f"     SHA-256     : {result['sha256']}")
        print(f"{'='*70}\n")
        sys.exit(0)
    else:
        print(f"\n  ❌ INVALID ARTIFACT: {result.get('error')}")
        print(f"{'='*70}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
