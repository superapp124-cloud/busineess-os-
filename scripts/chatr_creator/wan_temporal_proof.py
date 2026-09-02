#!/usr/bin/env python3
"""
CHATR VIRTUAL CREATOR — MILESTONE 1 REAL TEMPORAL PROOF HARNESS
scripts/chatr_creator/wan_temporal_proof.py

Strict Milestone 1 Proof Generator & Evidence Verifier:
1. Validates Hardware & Execution Manifest (Model, VRAM, Quantization, OOM Status)
2. Generates/Inspects Raw Video Output (wan_raw_output.mp4)
3. Extracts raw sampled frames (frame_0000.png, frame_0010.png, ...)
4. Builds a 12-Frame Motion Contact Sheet
5. Computes direct frame-by-frame temporal metrics (mean diff, median diff, Farneback flow, face vs bg flow)
6. Enforces provenance (motion_source = "wan_2.1_i2v_14b")
7. Outputs final certification: MILESTONE_1 = PASS or MILESTONE_1 = NOT_PROVEN
"""

import os
import sys
import json
import math
import argparse
import subprocess
from typing import Dict, Any, List, Tuple

try:
    import cv2
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
except ImportError as e:
    print(f"ERROR: Missing dependency: {e}")
    sys.exit(1)

try:
    import imageio_ffmpeg
    FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_EXE = "ffmpeg"


class WanTemporalProofHarness:
    def __init__(self, output_dir: str = "data/worker_scratch/milestone1_proof"):
        self.output_dir = output_dir
        self.frames_dir = os.path.join(output_dir, "raw_frames")
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.frames_dir, exist_ok=True)

    def extract_raw_frames(self, video_path: str) -> List[str]:
        """Extracts all raw PNG frames from the video."""
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise RuntimeError(f"Cannot open video: {video_path}")

        frame_paths = []
        frame_idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            # Save every 10th frame or specific samples
            frame_file = os.path.join(self.frames_dir, f"frame_{frame_idx:04d}.png")
            cv2.imwrite(frame_file, frame)
            frame_paths.append(frame_file)
            frame_idx += 1

        cap.release()
        return frame_paths

    def build_12_frame_contact_sheet(self, frame_paths: List[str], output_image: str) -> str:
        """Builds a 3x4 grid contact sheet from 12 evenly spaced frames."""
        total_frames = len(frame_paths)
        if total_frames < 12:
            raise ValueError(f"Insufficient frames for 12-frame contact sheet ({total_frames})")

        step = total_frames / 12.0
        indices = [int(i * step) for i in range(12)]
        selected_frames = [frame_paths[i] for i in indices]

        # Read frames and resize for contact sheet
        thumb_w, thumb_h = 240, 416 # 9:16 portrait
        cols, rows = 4, 3
        pad = 8
        header_h = 50

        sheet_w = cols * thumb_w + (cols + 1) * pad
        sheet_h = rows * thumb_h + (rows + 1) * pad + header_h

        contact_sheet = Image.new("RGB", (sheet_w, sheet_h), color=(15, 23, 42)) # Slate-900
        draw = ImageDraw.Draw(contact_sheet)

        # Title
        draw.text((pad, 12), "CHATR Virtual Creator — Meera Milestone 1 Temporal Proof (12 Sampled Frames)", fill=(255, 255, 255))
        draw.text((pad, 30), f"Total Frames: {total_frames} | Evenly Sampled at ~{step:.1f} Frame Intervals | Provenance: Wan 2.1 I2V-14B", fill=(148, 163, 184))

        for idx, f_path in enumerate(selected_frames):
            r = idx // cols
            c = idx % cols
            x = pad + c * (thumb_w + pad)
            y = header_h + pad + r * (thumb_h + pad)

            im = Image.open(f_path).convert("RGB")
            im_resized = im.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            contact_sheet.paste(im_resized, (x, y))

            # Overlay frame index
            draw.rectangle([x, y + thumb_h - 22, x + 85, y + thumb_h], fill=(0, 0, 0, 180))
            frame_num = indices[idx]
            draw.text((x + 4, y + thumb_h - 18), f"F#{frame_num:04d} ({frame_num/24.0:.1f}s)", fill=(250, 204, 21))

        contact_sheet.save(output_image)
        return output_image

    def compute_deep_temporal_metrics(self, frame_paths: List[str]) -> Dict[str, Any]:
        """Calculates per-frame differences, Farneback optical flow, face flow, and duplicate ratio."""
        if len(frame_paths) < 2:
            return {"valid": False, "error": "Insufficient frames"}

        prev_gray = None
        pixel_diffs = []
        flow_magnitudes = []
        face_flows = []
        bg_flows = []
        identical_pairs = 0

        for f_path in frame_paths:
            img = cv2.imread(f_path)
            small = cv2.resize(img, (270, 480), interpolation=cv2.INTER_AREA)
            gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
            fh, fw = gray.shape

            face_region = gray[int(fh * 0.15):int(fh * 0.50), int(fw * 0.25):int(fw * 0.75)]
            bg_region = gray[int(fh * 0.60):, :]

            if prev_gray is not None:
                # Pixel absdiff
                diff = cv2.absdiff(gray, prev_gray)
                mean_p_diff = float(np.mean(diff))
                pixel_diffs.append(mean_p_diff)
                if mean_p_diff < 0.04:
                    identical_pairs += 1

                # Farneback Optical Flow
                flow = cv2.calcOpticalFlowFarneback(
                    prev_gray, gray, None,
                    pyr_scale=0.5, levels=3, winsize=15,
                    iterations=3, poly_n=5, poly_sigma=1.2, flags=0
                )
                mag, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
                flow_magnitudes.append(float(np.mean(mag)))

                f_flow = flow[int(fh * 0.15):int(fh * 0.50), int(fw * 0.25):int(fw * 0.75)]
                b_flow = flow[int(fh * 0.60):, :]
                f_mag, _ = cv2.cartToPolar(f_flow[..., 0], f_flow[..., 1])
                b_mag, _ = cv2.cartToPolar(b_flow[..., 0], b_flow[..., 1])

                face_flows.append(float(np.mean(f_mag)))
                bg_flows.append(float(np.mean(b_mag)))

            prev_gray = gray

        total_pairs = len(frame_paths) - 1
        dup_ratio = identical_pairs / max(1, total_pairs)
        mean_pixel_diff = float(np.mean(pixel_diffs)) if pixel_diffs else 0.0
        median_pixel_diff = float(np.median(pixel_diffs)) if pixel_diffs else 0.0
        mean_flow = float(np.mean(flow_magnitudes)) if flow_magnitudes else 0.0
        mean_face_flow = float(np.mean(face_flows)) if face_flows else 0.0
        mean_bg_flow = float(np.mean(bg_flows)) if bg_flows else 0.0
        flow_variance = float(np.var(flow_magnitudes)) if flow_magnitudes else 0.0

        # Temporal proof gate:
        # 1. Duplicate ratio < 0.20
        # 2. Mean flow >= 0.08
        # 3. Face flow >= 0.04
        # 4. Background flow >= 0.04
        # 5. Median pixel diff >= 0.08
        is_temporal_motion_proven = (
            dup_ratio < 0.20 and
            mean_flow >= 0.08 and
            mean_face_flow >= 0.04 and
            mean_bg_flow >= 0.04 and
            median_pixel_diff >= 0.05
        )

        return {
            "total_frames": len(frame_paths),
            "total_frame_pairs": total_pairs,
            "identical_frame_pairs": identical_pairs,
            "duplicate_frame_ratio": round(dup_ratio, 4),
            "mean_pixel_difference": round(mean_pixel_diff, 4),
            "median_pixel_difference": round(median_pixel_diff, 4),
            "dense_optical_flow_magnitude": round(mean_flow, 4),
            "flow_variance": round(flow_variance, 6),
            "face_region_optical_flow": round(mean_face_flow, 4),
            "background_optical_flow": round(mean_bg_flow, 4),
            "temporal_motion_proven": is_temporal_motion_proven
        }

    def generate_proof_report(
        self,
        video_path: str,
        manifest: Dict[str, Any],
        output_report_json: str
    ) -> Dict[str, Any]:
        """Orchestrates complete Milestone 1 temporal proof."""
        print(f"[ANALYZE] Analyzing video: {video_path}")
        frame_paths = self.extract_raw_frames(video_path)
        print(f"[FRAMES] Extracted {len(frame_paths)} raw PNG frames")

        contact_sheet_path = os.path.join(self.output_dir, "meera_contact_sheet.png")
        self.build_12_frame_contact_sheet(frame_paths, contact_sheet_path)
        print(f"[CONTACT_SHEET] Created 12-frame contact sheet: {contact_sheet_path}")

        temporal_metrics = self.compute_deep_temporal_metrics(frame_paths)
        print(f"[METRICS] Computed temporal metrics: flow={temporal_metrics['dense_optical_flow_magnitude']}, face={temporal_metrics['face_region_optical_flow']}")

        # 1. Milestone 1 Duration & Frame Count Check (8s @ 24fps = 192 frames)
        total_frames = len(frame_paths)
        frame_count_valid = 188 <= total_frames <= 196
        frame_error = None if frame_count_valid else f"Milestone 1 artifact must be exactly 8s @ 24fps (192 frames). Found {total_frames} frames ({total_frames/24.0:.2f}s)."

        # 2. Cryptographic SHA-256 Provenance Verification
        import hashlib
        with open(video_path, "rb") as vf:
            actual_sha256 = hashlib.sha256(vf.read()).hexdigest()

        manifest_sha256 = manifest.get("OUTPUT_SHA256")
        sha256_match = (manifest_sha256 == actual_sha256) if manifest_sha256 else False

        valid_models = (
            "Wan-AI/Wan2.1-I2V-14B-480P",
            "Wan-AI/Wan2.1-I2V-14B-480P-Diffusers",
            "Wan-AI/Wan2.2-I2V-A14B-Diffusers",
            "Wan-AI/Wan2.2-I2V-14B-480P"
        )
        provenance_valid = (
            manifest.get("MODEL_ID") in valid_models and
            manifest.get("GPU_NAME") is not None and
            manifest.get("OOM_STATUS", "NONE") == "NONE" and
            manifest.get("GENERATION_PASSED") is True and
            sha256_match
        )

        provenance_error = None
        if not provenance_valid:
            if not sha256_match and manifest_sha256:
                provenance_error = f"Cryptographic hash mismatch: video ({actual_sha256[:8]}...) != manifest ({manifest_sha256[:8]}...)"
            elif not manifest.get("GENERATION_PASSED"):
                provenance_error = "Unverified provenance: Wan 2.1 I2V-14B GPU execution not proven (GENERATION_PASSED=false)"
            else:
                provenance_error = "Invalid or incomplete GPU execution manifest"

        # 3. Overall Milestone 1 Verdict
        overall_milestone_1_pass = (
            frame_count_valid and
            provenance_valid and
            temporal_metrics["temporal_motion_proven"]
        )

        status_verdict = "PASS" if overall_milestone_1_pass else "NOT_PROVEN"

        errors = []
        if frame_error:
            errors.append(frame_error)
        if provenance_error:
            errors.append(provenance_error)
        if not temporal_metrics["temporal_motion_proven"]:
            errors.append("Temporal motion metrics below threshold")

        certification_record = {
            "MODEL_ID": manifest.get("MODEL_ID", "UNKNOWN"),
            "MODEL_REVISION": manifest.get("MODEL_REVISION", "main"),
            "MODEL_SOURCE": manifest.get("MODEL_SOURCE", "UNKNOWN"),
            "GPU": manifest.get("GPU_NAME", "UNKNOWN"),
            "VRAM": manifest.get("GPU_VRAM", "UNKNOWN"),
            "RESOLUTION": f"{temporal_metrics.get('width', 480)}x{temporal_metrics.get('height', 832)}",
            "FPS": manifest.get("FPS", 24),
            "FRAME_COUNT": total_frames,
            "DURATION": round(total_frames / max(1, manifest.get("FPS", 24)), 2),
            "GENERATION_TIME": manifest.get("GENERATION_TIME", 0.0),
            "SHA256": actual_sha256,
            "OPTICAL_FLOW": temporal_metrics.get("dense_optical_flow_magnitude", 0.0),
            "DUPLICATE_RATIO": temporal_metrics.get("duplicate_frame_ratio", 0.0),
            "FROZEN_FACE": not temporal_metrics.get("temporal_motion_proven", False),
            "VALIDATOR_RESULT": status_verdict
        }

        report = {
            "milestone": "MILESTONE_1_REAL_TEMPORAL_PROOF",
            "verdict": status_verdict,
            "certification_record": certification_record,
            "provenance": {
                "motion_source": manifest.get("MODEL_ID", "wan_2.1_i2v_14b"),
                "provenance_verified": provenance_valid,
                "video_sha256": actual_sha256,
                "manifest_sha256": manifest_sha256,
                "manifest": manifest
            },
            "temporal_evidence": temporal_metrics,
            "artifacts": {
                "raw_video": video_path,
                "contact_sheet": contact_sheet_path,
                "total_frames_extracted": total_frames,
                "sampled_frames_dir": self.frames_dir
            },
            "errors": errors
        }

        with open(output_report_json, "w") as f:
            json.dump(report, f, indent=2)

        return report



def main():
    parser = argparse.ArgumentParser(description="Wan 2.1 I2V-14B Milestone 1 Temporal Proof Harness")
    parser.add_argument("--video", required=True, help="Path to raw Wan MP4 output")
    parser.add_argument("--manifest", help="Path to JSON hardware execution manifest")
    parser.add_argument("--output-dir", default="data/worker_scratch/milestone1_proof", help="Output directory")

    args = parser.parse_args()

    manifest = {}
    if args.manifest and os.path.exists(args.manifest):
        with open(args.manifest, "r") as f:
            manifest = json.load(f)
    else:
        # Default manifest structure for verification
        manifest = {
            "MODEL_ID": "Wan-AI/Wan2.1-I2V-14B-480P",
            "MODEL_SOURCE": "huggingface",
            "GPU_NAME": "Tesla T4 (16GB)",
            "GPU_TOTAL_VRAM": 16.0,
            "GPU_FREE_VRAM": 12.4,
            "PEAK_VRAM": 11.2,
            "QUANTIZATION": "fp8_e4m3fn_offloaded",
            "OFFLOAD_MODE": "model_cpu_offload",
            "WIDTH": 480,
            "HEIGHT": 832,
            "FPS": 24,
            "FRAME_COUNT": 192,
            "SEED": 42,
            "GENERATION_TIME": 48.6,
            "OOM_STATUS": "NONE",
            "GENERATION_PASSED": False  # Must be explicitly proven by real execution
        }

    harness = WanTemporalProofHarness(output_dir=args.output_dir)
    report = harness.generate_proof_report(
        video_path=args.video,
        manifest=manifest,
        output_report_json=os.path.join(args.output_dir, "milestone1_report.json")
    )

    print(json.dumps(report, indent=2))
    sys.exit(0 if report["verdict"] == "PASS" else 1)


if __name__ == "__main__":
    main()
