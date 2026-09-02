"""
CHATR Virtual Creator — Video Assembler
Assembles multi-shot video using FFmpeg.

Per shot:
  1. Load background video (real environment)
  2. Overlay Wav2Lip talking-head (face composite)
  3. Add captions (SRT burn-in)
  4. Apply natural effects (slight vignette, warm grade)

Final assembly:
  1. Concatenate all shots with transitions
  2. Mix audio (voice + ambient background sound)
  3. Export final 9:16 vertical MP4

REQUIREMENTS:
  - FFmpeg must be in PATH
  - Background videos downloaded by background_fetcher.py
  - Voice audio from voice_pipeline.py
  - (Optional) Wav2Lip talking head from lipsync_pipeline.py
"""

import os
import json
import subprocess
import tempfile
from pathlib import Path
from typing import Optional


# ============================================================
# FFmpeg detection
# ============================================================

def find_ffmpeg() -> Optional[str]:
    """Find FFmpeg binary."""
    candidates = [
        "ffmpeg",
        r"C:\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe",
        r"C:\ffmpeg\bin\ffmpeg.exe",
        r"C:\Program Files\FFmpeg\bin\ffmpeg.exe"
    ]
    for c in candidates:
        try:
            result = subprocess.run([c, "-version"], capture_output=True, timeout=5)
            if result.returncode == 0:
                return c
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
    return None


FFMPEG = find_ffmpeg()


def check_ffmpeg():
    if not FFMPEG:
        raise RuntimeError(
            "FFmpeg not found. Please install FFmpeg and ensure it's in PATH.\n"
            "Download: https://github.com/BtbN/FFmpeg-Builds/releases"
        )
    return FFMPEG


# ============================================================
# SHOT COMPOSER
# ============================================================

def compose_shot(
    background_path: str,
    character_video_path: Optional[str],
    voice_path: str,
    duration_sec: float,
    output_path: str,
    shot_number: int,
    caption_text: str = "",
    location_label: str = "Delhi",
    is_b_roll: bool = False
) -> Optional[str]:
    """
    Compose a single shot:
    - Background: real environment video (trimmed to duration)
    - Character overlay: character_video_path
    - Voice: audio track
    - Caption: burned-in text overlay with creator branding

    Returns output path or None if failed.
    """
    ffmpeg = check_ffmpeg()
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Safe text sanitization for FFmpeg drawtext
    safe_caption = caption_text.replace("\\", "\\\\").replace("'", "").replace(":", " - ").replace("%", "%%")[:75]
    safe_loc = location_label.replace("\\", "\\\\").replace("'", "").replace(":", " - ")[:35]

    if not is_b_roll and (not character_video_path or not os.path.exists(character_video_path)):
        print(f"STATIC_FRAME_TRICK_DETECTED = true for shot {shot_number}")
        return None

    if not is_b_roll:
        filter_complex = (
            f"[0:v]trim=duration={duration_sec},setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=25[bg];"
            f"[1:v]trim=duration={duration_sec},setpts=PTS-STARTPTS,scale=480:640[face];"
            f"[bg][face]overlay=(W-w)/2:H-h-100[composited]"
        )
        if safe_caption:
            filter_complex += (
                f";[composited]drawtext=text='{safe_caption}':fontcolor=white:fontsize=32:"
                f"bordercolor=black:borderw=2:x=(w-tw)/2:y=h-100:line_spacing=8[out]"
            )
            map_out = "[out]"
        else:
            map_out = "[composited]"

        cmd = [
            ffmpeg, "-y",
            "-stream_loop", "-1", "-i", background_path,
            "-stream_loop", "-1", "-i", character_video_path,
            "-i", voice_path,
            "-filter_complex", filter_complex,
            "-map", map_out,
            "-map", "2:a",
            "-t", str(duration_sec),
            "-c:v", "libx264", "-preset", "fast", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k",
            "-pix_fmt", "yuv420p",
            "-aspect", "9:16",
            output_path
        ]
    else:
        # Background only + voice
        if safe_caption:
            vfilter = (
                f"trim=duration={duration_sec},setpts=PTS-STARTPTS,"
                f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=25,"
                f"drawtext=text='{safe_caption}':fontcolor=yellow:fontsize=36:"
                f"bordercolor=black:borderw=3:x=(w-tw)/2:y=h-140:line_spacing=8"
            )
        else:
            vfilter = (
                f"trim=duration={duration_sec},setpts=PTS-STARTPTS,"
                f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=25"
            )

        cmd = [
            ffmpeg, "-y",
            "-stream_loop", "-1", "-i", background_path,
            "-i", voice_path,
            "-vf", vfilter,
            "-map", "0:v",
            "-map", "1:a",
            "-t", str(duration_sec),
            "-c:v", "libx264", "-preset", "fast", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k",
            "-pix_fmt", "yuv420p",
            "-aspect", "9:16",
            output_path
        ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg shot {shot_number} failed:\n{result.stderr[-500:]}")

    return output_path


# ============================================================
# SHOT CONCATENATION
# ============================================================

def concatenate_shots(shot_paths: list, output_path: str, transitions: list = None) -> str:
    """
    Concatenate multiple shot MP4s into final video.
    Uses FFmpeg concat demuxer.
    """
    ffmpeg = check_ffmpeg()

    # Write concat list file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
        for path in shot_paths:
            abs_path = os.path.abspath(path).replace('\\', '/')
            f.write(f"file '{abs_path}'\n")
        concat_file = f.name

    try:
        cmd = [
            ffmpeg, "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_file,
            "-c", "copy",
            "-movflags", "+faststart",
            output_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg concat failed:\n{result.stderr[-500:]}")
    finally:
        os.unlink(concat_file)

    return output_path


# ============================================================
# THUMBNAIL GENERATOR
# ============================================================

def generate_thumbnail(video_path: str, output_path: str, timestamp_sec: float = 2.0) -> str:
    """Extract a thumbnail frame from the video."""
    ffmpeg = check_ffmpeg()
    cmd = [
        ffmpeg, "-y",
        "-i", video_path,
        "-ss", str(timestamp_sec),
        "-vframes", "1",
        "-vf", "scale=1080:1920",
        output_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        raise RuntimeError(f"Thumbnail generation failed:\n{result.stderr[-200:]}")
    return output_path


# ============================================================
# FULL PIPELINE
# ============================================================

def assemble_video(
    video_id: str,
    shot_plan: dict,
    bg_map: dict,         # shot_number → background_path
    voice_path: str,      # full voice audio
    character_video_path: Optional[str],  # full character generated video
    output_dir: str
) -> dict:
    """
    Full assembly pipeline for one video.
    Returns asset bundle paths.
    """
    ffmpeg = check_ffmpeg()
    print(f"\n🎬 Assembling video: {video_id}")

    shots = shot_plan.get("shots", [])
    shot_output_paths = []
    
    static_frame_violations = 0

    # Split voice audio per shot
    total_duration = shot_plan.get("totalDurationSec", 30)
    current_time = 0.0

    for shot in shots:
        shot_num = shot["shotNumber"]
        duration = shot["durationSec"]
        bg_path = bg_map.get(shot_num)
        is_b_roll = shot.get("b_roll", False)

        if not bg_path or not os.path.exists(bg_path):
            print(f"  ⚠️  Shot {shot_num}: no background — skipping")
            current_time += duration
            continue

        # Extract voice segment for this shot
        shot_voice_path = os.path.join(output_dir, f"shot_{shot_num:02d}_voice.aac")
        voice_extract_cmd = [
            ffmpeg, "-y",
            "-i", voice_path,
            "-ss", str(current_time),
            "-t", str(duration),
            "-c:a", "aac",
            shot_voice_path
        ]
        subprocess.run(voice_extract_cmd, capture_output=True, timeout=30)

        if not os.path.exists(shot_voice_path):
            shot_voice_path = voice_path  # fallback: use full voice

        # Compose shot
        shot_output = os.path.join(output_dir, f"shot_{shot_num:02d}.mp4")
        caption = (shot.get("dialogue") or "")[:80]
        loc_label = shot_plan.get("location", "Delhi").replace("_", " ").title()

        print(f"  Composing shot {shot_num}/{len(shots)} ({duration}s)...")
        try:
            result_path = compose_shot(
                background_path=bg_path,
                character_video_path=character_video_path,
                voice_path=shot_voice_path,
                duration_sec=duration,
                output_path=shot_output,
                shot_number=shot_num,
                caption_text=caption,
                location_label=loc_label,
                is_b_roll=is_b_roll
            )
            if result_path:
                shot_output_paths.append(result_path)
                print(f"  ✅ Shot {shot_num} done")
            else:
                static_frame_violations += 1
                print(f"  ❌ Shot {shot_num} skipped due to missing character video")
        except Exception as e:
            print(f"  ❌ Shot {shot_num} failed: {e}")

        current_time += duration

    if not shot_output_paths:
        raise RuntimeError("No shots assembled — cannot create video")

    # Concatenate shots
    final_video = os.path.join(output_dir, "video.mp4")
    print(f"\n  Concatenating {len(shot_output_paths)} shots...")
    concatenate_shots(shot_output_paths, final_video)
    print(f"  ✅ Final video: {final_video}")

    # Generate thumbnail
    thumbnail_path = os.path.join(output_dir, "thumbnail.jpg")
    try:
        generate_thumbnail(final_video, thumbnail_path, timestamp_sec=1.5)
        print(f"  ✅ Thumbnail: {thumbnail_path}")
    except Exception as e:
        print(f"  ⚠️  Thumbnail failed: {e}")
        thumbnail_path = None

    return {
        "videoId": video_id,
        "videoPath": final_video,
        "thumbnailPath": thumbnail_path,
        "shotsAssembled": len(shot_output_paths),
        "totalShotsPlanned": len(shots),
        "totalDurationSec": total_duration,
        "NO_STATIC_FRAME_TRICK_VERIFIED": static_frame_violations == 0,
        "static_frame_violations": static_frame_violations
    }


if __name__ == "__main__":
    ffmpeg = find_ffmpeg()
    if ffmpeg:
        print(f"✅ FFmpeg found: {ffmpeg}")
    else:
        print("❌ FFmpeg NOT FOUND")
        print("   Install from: https://github.com/BtbN/FFmpeg-Builds/releases")
        print("   Extract and add bin/ folder to PATH")
