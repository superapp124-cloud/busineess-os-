#!/usr/bin/env python3
import os, subprocess, json, shutil
from pathlib import Path
import edge_tts, asyncio

os.chdir(r"c:\Users\Arshid.Wani\chatrchat")

t_dir = Path("public/videos/meera/food_reel_test")
t_dir.mkdir(parents=True, exist_ok=True)

# 1. Edge-TTS full voice
script = "Hey guys! We are live at this incredible Asian street food night market to settle the debate: Delhi street food versus authentic Chinese woks! Look at those sizzling noodles and momos on the flame. Let me take a bite... oh wow, that chili crunch is unreal! 10 out of 10 recommendation. Drop your favorite street food spot in the comments and subscribe!"
voice_file = str(t_dir / "voice.mp3")

async def make_voice():
    c = edge_tts.Communicate(script, "en-IN-NeerjaNeural", rate="+3%")
    await c.save(voice_file)

asyncio.run(make_voice())
print("✅ Voice generated!")

# 2. Render each distinct story shot
shots = [
    ("public/videos/meera/meera_streetfood_master.mp4", 7.5),
    ("public/videos/meera/food_sizzle_broll.mp4", 7.5),
    ("public/videos/meera/meera_food_taste.mp4", 8.0),
    ("public/videos/meera/meera_streetfood_master.mp4", 7.0)
]

shot_files = []
for idx, (s_src, dur) in enumerate(shots):
    out = str(t_dir / f"shot_{idx}.mp4")
    cmd = [
        "ffmpeg", "-y", "-i", s_src, "-t", str(dur),
        "-vf", "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=24",
        "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-an",
        out
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    shot_files.append(out)

# 3. Concat all 4 unique story shots
manifest = t_dir / "manifest.txt"
with open(manifest, "w") as f:
    for s in shot_files:
        clean = Path(s).resolve().as_posix()
        f.write(f"file '{clean}'\n")

raw_concat = str(t_dir / "raw_story.mp4")
subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(manifest), "-c", "copy", raw_concat], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# 4. Master with full voice
master_out = "public/chatr/live_generated/meera_food_vlog_30s.mp4"
cmd_mux = [
    "ffmpeg", "-y", "-i", raw_concat,
    "-stream_loop", "-1", "-i", voice_file,
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
    "-t", "30.0", "-map", "0:v:0", "-map", "1:a:0",
    master_out
]
subprocess.run(cmd_mux, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

shutil.copy2(master_out, "public/videos/meera/meera_veo31_master.mp4")
shutil.copy2(master_out, "public/chatr/live_generated/meera_latest.mp4")

print(f"🎉 ASSEMBLED AUTHENTIC 30S INFLUENCER FOOD VLOG! Size: {os.path.getsize(master_out)//1024} KB")
