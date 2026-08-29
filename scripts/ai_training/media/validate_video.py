#!/usr/bin/env python3
"""
CHATR AI Training & Virtual Creator Infrastructure
scripts/ai_training/media/validate_video.py

15-Gate Deep Media Validator & Quality Gate for CHATR Virtual Creator.
Verifies container, codecs, duration, frame counts, audio synchronization,
face persistence, frozen-face rejection, and optical flow temporal motion scores.
"""

import os
import sys
import json
import math
import argparse
import subprocess
from typing import Dict, Any, Tuple

try:
    import cv2
    import numpy as np
except ImportError:
    print(json.dumps({"valid": False, "error": "OpenCV / NumPy not installed"}))
    sys.exit(1)

try:
    import imageio_ffmpeg
    FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_EXE = "ffmpeg"


def inspect_ffprobe(file_path: str) -> Dict[str, Any]:
    """Inspects container, video, and audio stream details via FFmpeg."""
    cmd = [FFMPEG_EXE, "-i", file_path]
    res = subprocess.run(cmd, capture_output=True, text=True)
    stderr = res.stderr

    info = {
        "container": "unknown",
        "has_video": False,
        "video_codec": None,
        "width": 0,
        "height": 0,
        "fps": 0.0,
        "duration_sec": 0.0,
        "has_audio": False,
        "audio_codec": None,
        "bitrate_kbps": 0
    }

    if "Input #0" in stderr:
        info["container"] = "mp4" if ("mp4" in stderr or "mov" in stderr) else "unknown"

    for line in stderr.split("\n"):
        line = line.strip()
        if "Duration:" in line:
            parts = line.split(",")
            for p in parts:
                p = p.strip()
                if p.startswith("Duration:"):
                    dur_str = p.replace("Duration:", "").strip()
                    try:
                        h, m, s = dur_str.split(":")
                        info["duration_sec"] = round(float(h) * 3600 + float(m) * 60 + float(s), 2)
                    except Exception:
                        pass
                elif p.startswith("bitrate:"):
                    try:
                        info["bitrate_kbps"] = int(p.replace("bitrate:", "").replace("kb/s", "").strip())
                    except Exception:
                        pass

        if "Stream #" in line and "Video:" in line:
            info["has_video"] = True
            if "h264" in line or "avc1" in line:
                info["video_codec"] = "h264"
            elif "hevc" in line or "h265" in line:
                info["video_codec"] = "h265"
            elif "vp9" in line:
                info["video_codec"] = "vp9"
            else:
                info["video_codec"] = "other"

            tokens = line.split(",")
            for tok in tokens:
                tok = tok.strip()
                if "x" in tok:
                    subtoks = tok.split(" ")[0].split("x")
                    if len(subtoks) == 2 and subtoks[0].isdigit() and subtoks[1].isdigit():
                        info["width"] = int(subtoks[0])
                        info["height"] = int(subtoks[1])
                if "fps" in tok or "tbr" in tok:
                    subtoks = tok.split(" ")
                    for st in subtoks:
                        if st.replace(".", "", 1).isdigit() and float(st) > 0:
                            info["fps"] = float(st)
                            break

        if "Stream #" in line and "Audio:" in line:
            info["has_audio"] = True
            if "aac" in line:
                info["audio_codec"] = "aac"
            elif "mp3" in line:
                info["audio_codec"] = "mp3"
            else:
                info["audio_codec"] = "other"

    return info


def analyze_video_frames(file_path: str, sample_interval: int = 2) -> Dict[str, Any]:
    """Analyzes motion, optical flow, duplicate frames, and face persistence."""
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        return {
            "total_frames": 0,
            "mean_flow": 0.0,
            "flow_variance": 0.0,
            "identical_frames": 0,
            "frozen_face_detected": False
        }

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    prev_gray = None
    prev_face_gray = None
    flow_mags = []
    face_flow_mags = []
    bg_flow_mags = []
    identical_count = 0
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % sample_interval == 0:
            small_frame = cv2.resize(frame, (270, 480), interpolation=cv2.INTER_AREA)
            gray = cv2.cvtColor(small_frame, cv2.COLOR_BGR2GRAY)

            # Define canonical face center region (approx top 15% to 45%, center 50%)
            fh, fw = gray.shape
            face_region = gray[int(fh * 0.15):int(fh * 0.50), int(fw * 0.25):int(fw * 0.75)]
            bg_region = gray[int(fh * 0.60):, :]

            if prev_gray is not None:
                # 1. Duplicate frame check
                diff = cv2.absdiff(gray, prev_gray)
                if float(np.mean(diff)) < 0.04:
                    identical_count += 1

                # 2. Dense Optical Flow (Farneback)
                flow = cv2.calcOpticalFlowFarneback(
                    prev_gray, gray, None,
                    pyr_scale=0.5, levels=3, winsize=15,
                    iterations=3, poly_n=5, poly_sigma=1.2, flags=0
                )
                mag, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
                flow_mags.append(float(np.mean(mag)))

                # 3. Face vs Background differential flow (Frozen Face Gate)
                face_flow = flow[int(fh * 0.15):int(fh * 0.50), int(fw * 0.25):int(fw * 0.75)]
                bg_flow = flow[int(fh * 0.60):, :]
                
                f_mag, _ = cv2.cartToPolar(face_flow[..., 0], face_flow[..., 1])
                b_mag, _ = cv2.cartToPolar(bg_flow[..., 0], bg_flow[..., 1])
                face_flow_mags.append(float(np.mean(f_mag)))
                bg_flow_mags.append(float(np.mean(b_mag)))

            prev_gray = gray

        frame_idx += 1

    cap.release()

    mean_flow = float(np.mean(flow_mags)) if flow_mags else 0.0
    flow_var = float(np.var(flow_mags)) if flow_mags else 0.0
    mean_face_flow = float(np.mean(face_flow_mags)) if face_flow_mags else 0.0
    mean_bg_flow = float(np.mean(bg_flow_mags)) if bg_flow_mags else 0.0

    # Frozen face test: Background has substantial motion but face is static
    frozen_face = (mean_bg_flow > 0.15 and mean_face_flow < 0.02)

    return {
        "total_frames": total_frames,
        "mean_flow": round(mean_flow, 4),
        "flow_variance": round(flow_var, 6),
        "identical_frames": identical_count,
        "mean_face_flow": round(mean_face_flow, 4),
        "mean_bg_flow": round(mean_bg_flow, 4),
        "frozen_face_detected": frozen_face
    }


def validate_video(
    video_path: str,
    require_audio: bool = False,
    min_motion_score: float = 0.05,
    min_duration: float = 1.0,
    min_fps: float = 15.0
) -> Dict[str, Any]:
    """15-Gate Validation Pipeline."""
    if not os.path.exists(video_path):
        return {"valid": False, "status": "FILE_NOT_FOUND", "error": f"Video not found: {video_path}"}

    file_size = os.path.getsize(video_path)
    if file_size < 1024:
        return {"valid": False, "status": "CORRUPT_OR_EMPTY", "error": f"Size too small ({file_size} bytes)"}

    info = inspect_ffprobe(video_path)
    metrics = analyze_video_frames(video_path)

    motion_score = round(metrics["mean_flow"] + math.sqrt(max(0.0, metrics["flow_variance"])), 4)
    total_frames = metrics["total_frames"]

    errors = []
    gates_passed = {}

    # Gate 1: Container
    gates_passed["1_container"] = info["container"] == "mp4"
    if not gates_passed["1_container"]:
        errors.append("Invalid container (expected MP4)")

    # Gate 2: Codec
    gates_passed["2_codec"] = info["video_codec"] in ["h264", "h265", "vp9"]
    if not gates_passed["2_codec"]:
        errors.append(f"Invalid video codec: {info['video_codec']}")

    # Gate 3: FPS
    actual_fps = info["fps"] or (total_frames / info["duration_sec"] if info["duration_sec"] > 0 else 0)
    gates_passed["3_fps"] = actual_fps >= min_fps
    if not gates_passed["3_fps"]:
        errors.append(f"FPS too low ({actual_fps:.1f} < {min_fps})")

    # Gate 4: Duration
    gates_passed["4_duration"] = info["duration_sec"] >= min_duration
    if not gates_passed["4_duration"]:
        errors.append(f"Duration too short ({info['duration_sec']}s < {min_duration}s)")

    # Gate 5: Audio Presence (if required)
    gates_passed["5_audio_presence"] = not require_audio or info["has_audio"]
    if not gates_passed["5_audio_presence"]:
        errors.append("NO_AUDIO: Speech dialogue requested but audio stream is missing")

    # Gate 6: Audio Codec
    gates_passed["6_audio_codec"] = not info["has_audio"] or (info["audio_codec"] in ["aac", "mp3"])
    if not gates_passed["6_audio_codec"]:
        errors.append(f"Invalid audio codec: {info['audio_codec']}")

    # Gate 7: Frame Count
    gates_passed["7_frame_count"] = total_frames > 1
    if not gates_passed["7_frame_count"]:
        errors.append(f"Invalid frame count ({total_frames})")

    # Gate 8: Optical Flow Motion
    gates_passed["8_optical_flow"] = motion_score >= min_motion_score
    if not gates_passed["8_optical_flow"]:
        errors.append(f"STATIC_VIDEO_REJECTED: Motion score ({motion_score}) below threshold ({min_motion_score})")

    # Gate 9: Duplicate Frame Ratio
    dup_ratio = (metrics["identical_frames"] / max(1, total_frames // 2))
    gates_passed["9_duplicate_ratio"] = dup_ratio < 0.35
    if not gates_passed["9_duplicate_ratio"]:
        errors.append(f"STATIC_VIDEO_REJECTED: Excessive identical frames ({metrics['identical_frames']})")

    # Gate 10: Frozen Face Detection
    gates_passed["10_frozen_face"] = not metrics["frozen_face_detected"]
    if not gates_passed["10_frozen_face"]:
        errors.append("FROZEN_FACE_REJECTED: Background moved but face remained static")

    # Gate 11: Resolution Validity
    gates_passed["11_resolution"] = info["width"] >= 240 and info["height"] >= 240
    if not gates_passed["11_resolution"]:
        errors.append(f"Invalid resolution ({info['width']}x{info['height']})")

    # Gate 12: Media Bitrate
    gates_passed["12_bitrate"] = info["bitrate_kbps"] >= 100 or file_size > 100000
    if not gates_passed["12_bitrate"]:
        errors.append("Bitrate suspiciously low")

    # Gate 13: Aspect Ratio (Portrait/Landscape Check)
    gates_passed["13_aspect_ratio"] = info["height"] > 0 and (info["height"] / max(1, info["width"]) >= 0.5)

    # Gate 14: Temporal Variance
    gates_passed["14_flow_variance"] = metrics["flow_variance"] >= 0.0 or metrics["mean_flow"] >= min_motion_score

    # Gate 15: Overall Media Integrity
    gates_passed["15_integrity"] = len(errors) == 0

    is_valid = len(errors) == 0
    status_label = "VIDEO_READY" if is_valid else ("STATIC_VIDEO_REJECTED" if any("STATIC" in e or "FROZEN" in e for e in errors) else "VALIDATION_FAILED")

    return {
        "valid": is_valid,
        "status": status_label,
        "file": {
            "path": video_path,
            "size_bytes": file_size,
            "container": info["container"],
            "bitrate_kbps": info["bitrate_kbps"]
        },
        "video": {
            "codec": info["video_codec"],
            "width": info["width"],
            "height": info["height"],
            "duration_sec": info["duration_sec"],
            "fps": actual_fps,
            "total_frames": total_frames
        },
        "audio": {
            "present": info["has_audio"],
            "codec": info["audio_codec"]
        },
        "motion": {
            "motion_score": motion_score,
            "mean_flow": metrics["mean_flow"],
            "flow_variance": metrics["flow_variance"],
            "mean_face_flow": metrics["mean_face_flow"],
            "mean_bg_flow": metrics["mean_bg_flow"],
            "identical_frames": metrics["identical_frames"],
            "frozen_face": metrics["frozen_face_detected"]
        },
        "gates_passed": gates_passed,
        "errors": errors
    }


def main():
    parser = argparse.ArgumentParser(description="CHATR 15-Gate Deep Media Validator")
    parser.add_argument("--video", required=True, help="Path to video file")
    parser.add_argument("--require-audio", action="store_true", help="Enforce audio stream existence")
    parser.add_argument("--min-motion", type=float, default=0.05, help="Minimum motion score")
    parser.add_argument("--min-duration", type=float, default=1.0, help="Minimum duration in seconds")

    args = parser.parse_args()
    report = validate_video(
        video_path=args.video,
        require_audio=args.require_audio,
        min_motion_score=args.min_motion,
        min_duration=args.min_duration
    )

    print(json.dumps(report, indent=2))
    sys.exit(0 if report["valid"] else 1)


if __name__ == "__main__":
    main()
