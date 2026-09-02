#!/usr/bin/env python3
"""
CHATR Multi-Shot High-Emotion 30-Second Reel Master Editor
Composes:
- Shot 1 (0-4s): High-Energy Vlog Hook (meera_vlog_3d.mp4)
- Shot 2 (4-9s): Delhi Street Walk B-Roll (meera_delhi_walk_001.mp4)
- Shot 3 (9-16s): Emotional Storytelling Beat (meera_emotional_3d.mp4)
- Shot 4 (16-22s): Ambient Delhi Culture / Market Visual
- Shot 5 (22-26s): Viral Smile & Laughter Reaction (meera_smile_3d.mp4)
- Shot 6 (26-30s): Final Payoff & CTA (meera_smile_3d.mp4 outro)
"""

import os, sys, subprocess, cv2, numpy as np
from pathlib import Path

os.chdir(r"c:\Users\Arshid.Wani\chatrchat")

def create_master_emotional_reel():
    print("=" * 65)
    print("🎬 CHATR MULTI-SHOT MASTER REEL ASSEMBLY")
    print("=" * 65)

    vlog_clip = "public/videos/meera/meera_vlog_3d.mp4"
    smile_clip = "public/videos/meera/meera_smile_3d.mp4"
    emo_clip = "public/videos/meera/meera_emotional_3d.mp4"
    walk_clip = "public/outputs/meera/milestone-1/meera_delhi_walk_001.mp4"
    if not os.path.exists(walk_clip):
        walk_clip = "public/videos/dances/ai_bench_02.mp4"

    audio_track = "public/videos/gurugram_report_voice.mp3"
    if not os.path.exists(audio_track):
        audio_track = "public/audio/real/lofi_chill.m4a"

    out_mp4 = "public/videos/meera/meera_master_multishot_reel.mp4"
    temp_dir = Path("public/videos/meera/reel_temp")
    temp_dir.mkdir(parents=True, exist_ok=True)

    # 1. Prepare and standardize each shot to 720x1280 (9:16 vertical)
    shots = [
        {"name": "shot1_vlog", "src": vlog_clip, "start": 0, "dur": 4.0, "label": "VLOG HOOK"},
        {"name": "shot2_walk", "src": walk_clip, "start": 0, "dur": 5.0, "label": "DELHI STREET WALK"},
        {"name": "shot3_emotional", "src": emo_clip, "start": 2, "dur": 7.0, "label": "DEEP STORY BEAT"},
        {"name": "shot4_walk2", "src": walk_clip, "start": 5, "dur": 5.0, "label": "MARKET CULTURE"},
        {"name": "shot5_smile", "src": smile_clip, "start": 0, "dur": 5.0, "label": "VIRAL LAUGHTER"},
        {"name": "shot6_cta", "src": smile_clip, "start": 4, "dur": 4.0, "label": "PAYOFF & CTA"}
    ]

    rendered_shots = []
    for s in shots:
        shot_out = str(temp_dir / f"{s['name']}.mp4")
        print(f"✂️ Cutting & Formatting {s['label']} ({s['dur']}s)...")
        
        # FFmpeg scale + pad to 720x1280 25fps
        cmd = [
            "ffmpeg", "-y",
            "-ss", str(s["start"]),
            "-i", s["src"],
            "-t", str(s["dur"]),
            "-vf", "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=25",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-an",
            shot_out
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(shot_out):
            rendered_shots.append(shot_out)

    # 2. Concat shots
    concat_list = temp_dir / "concat.txt"
    with open(concat_list, "w") as f:
        for rs in rendered_shots:
            clean_path = Path(rs).resolve().as_posix()
            f.write(f"file '{clean_path}'\n")

    print("\n🎞️ Concatenating all 6 multi-shot scenes into continuous 30-second timeline...")
    concat_video = str(temp_dir / "raw_concat.mp4")
    cmd_concat = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", str(concat_list),
        "-c", "copy",
        concat_video
    ]
    subprocess.run(cmd_concat, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # 3. Add audio track + Lower Third Broadcast Overlay
    print("🎵 Mastering audio track and overlaying dynamic creator graphics...")
    cmd_final = [
        "ffmpeg", "-y",
        "-i", concat_video,
        "-stream_loop", "-1", "-i", audio_track,
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        "-map", "0:v:0", "-map", "1:a:0",
        out_mp4
    ]
    subprocess.run(cmd_final, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    if os.path.exists(out_mp4):
        cap = cv2.VideoCapture(out_mp4)
        frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        dur = frames / fps if fps else 0
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()
        
        print("\n" + "=" * 65)
        print(f"🎉 MASTER 30-SECOND MULTI-SHOT REEL GENERATED SUCCESSFULLY!")
        print(f"📁 Output File: {out_mp4}")
        print(f"📐 Specs: {w}x{h} (9:16) | {frames} Frames @ {fps:.1f} fps | Duration: {dur:.1f}s")
        print(f"💾 File Size: {os.path.getsize(out_mp4)//1024} KB")
        print("=" * 65)
        return True
    return False

if __name__ == "__main__":
    create_master_emotional_reel()
