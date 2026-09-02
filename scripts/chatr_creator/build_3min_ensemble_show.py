#!/usr/bin/env python3
"""
CHATR Autonomous Ensemble Production: 3-Minute 10-Creator Global Panel Show
"The Real State of Intelligence: 10 Creators Settle the AI Debate"

Features all 10 canonical AI creators in sequence (18s each = 180s total):
1. Meera Kapoor (@meera_wtf) — Host & Delhi Culture
2. Priya Sharma (@priya.ai_strat) — Enterprise AI Strategist
3. Rohan Varma (@rohan.systems) — Systems Engineering
4. Ananya Iyer (@ananya.creative) — Creative AI & Digital Arts
5. Vikram Joshi (@vikram.oss) — Open Source AI Infrastructure
6. Ishita Rao (@ishita.news) — Daily News & Trend Presenter
7. Arjun Mehta (@arjun.markets) — Fintech & Quantitative Markets
8. Zoya Khan (@zoya.ux) — Product Design & Spatial UX
9. Kabir Malhotra (@kabir.sec) — Cybersecurity & Adversarial ML
10. Dev Bhatia (@dev.explains) — Tech Explainer & High-Energy Outro
"""

import os, sys, asyncio, shutil, subprocess, time
from pathlib import Path
import cv2, numpy as np
import edge_tts

os.chdir(r"c:\Users\Arshid.Wani\chatrchat")
sys.path.insert(0, "scripts")

from chatr_creator.lipsync_engine import _render_local_lipsync_fallback

SHOW_SCRIPT = [
    {
        "id": "meera",
        "name": "Meera Kapoor",
        "handle": "@meera_wtf",
        "niche": "Delhi Culture, Relatable Humor & Vlogs",
        "voice": "hi-IN-SwaraNeural",
        "image": "public/characters/meera/master_face_crop.jpg",
        "text": "Okay Delhi, listen up! Sab log keh rahe hain ki AI sab kuch replace kar dega, but honestly half the founders I meet at Saket cafes don't even know what a tensor is. Today, I have assembled the ten sharpest minds across India to settle this once and for all. Priya, let's start with you."
    },
    {
        "id": "priya",
        "name": "Priya Sharma",
        "handle": "@priya.ai_strat",
        "niche": "Enterprise AI & Global Tech Strategy",
        "voice": "en-IN-NeerjaNeural",
        "image": "public/characters/priya/master_face_crop.jpg",
        "text": "Thanks Meera. Look, from an enterprise perspective, the narrative is completely shifting. Global corporations don't need trillion-parameter giant models to answer customer queries. They need specialized, agentic pipelines with sub-second determinism and verifiable guardrails."
    },
    {
        "id": "rohan",
        "name": "Rohan Varma",
        "handle": "@rohan.systems",
        "niche": "Systems Engineering & Hard Tech",
        "voice": "en-IN-PrabhatNeural",
        "image": "public/characters/rohan/master_face_crop.jpg",
        "text": "Bilkul sahi Priya. Aur main yahi bol raha hoon kab se. Stop benchmarking synthetic FLOPS. If your memory bandwidth throttles and you cannot run quantized weights locally on commodity silicon, you don't own your infrastructure, you're just renting an API."
    },
    {
        "id": "ananya",
        "name": "Ananya Iyer",
        "handle": "@ananya.creative",
        "niche": "Creative AI & Digital Arts",
        "voice": "en-IN-NeerjaNeural",
        "image": "public/characters/ananya/master_face_crop.jpg",
        "text": "Vanakkam everyone! From the creative lens, everyone is generating the same glossy plastic art. Real human resonance happens when we infuse living cultural heritage, classical temple geometry, and authentic regional aesthetic into generative diffusion systems."
    },
    {
        "id": "vikram",
        "name": "Vikram Joshi",
        "handle": "@vikram.oss",
        "niche": "Open Source & AI Infrastructure",
        "voice": "hi-IN-MadhurNeural",
        "image": "public/characters/vikram/master_face_crop.jpg",
        "text": "Aur Ananya ki baat bilkul accurate hai. Open source is the only defense against digital monopolies. Jab hum weights ko open karte hain, tab developer ecosystem self-reliant banta hai. Proprietary closed-source APIs will lose the long game."
    },
    {
        "id": "ishita",
        "name": "Ishita Rao",
        "handle": "@ishita.news",
        "niche": "Daily News & Trend Analysis",
        "voice": "hi-IN-SwaraNeural",
        "image": "public/characters/ishita/master_face_crop.jpg",
        "text": "Breaking numbers back this up Vikram. Our trend intelligence indicates a four hundred percent surge in open-source fine-tuning adoption across tier-two Indian tech hubs this quarter alone, transforming manufacturing, health diagnostics, and regional governance."
    },
    {
        "id": "arjun",
        "name": "Arjun Mehta",
        "handle": "@arjun.markets",
        "niche": "Fintech & Quantitative Markets",
        "voice": "en-IN-PrabhatNeural",
        "image": "public/characters/arjun/master_face_crop.jpg",
        "text": "And look at the capital markets. Global venture capital has stopped writing blank checks for generic AI wrappers. Investment funds are strictly rewarding positive unit economics, high gross margins, and actual compute efficiency."
    },
    {
        "id": "zoya",
        "name": "Zoya Khan",
        "handle": "@zoya.ux",
        "niche": "Product Design & Spatial UX",
        "voice": "hi-IN-SwaraNeural",
        "image": "public/characters/zoya/master_face_crop.jpg",
        "text": "And that efficiency has to translate into the user experience. Agar user ko AI use karne ke liye complex prompt engineering sikhni pade, then our design system has failed. Great product design makes intelligence feel completely invisible and ambient."
    },
    {
        "id": "kabir",
        "name": "Kabir Malhotra",
        "handle": "@kabir.sec",
        "niche": "Cybersecurity & Adversarial ML",
        "voice": "hi-IN-MadhurNeural",
        "image": "public/characters/kabir/master_face_crop.jpg",
        "text": "Par ek second, let's talk about the danger. The more autonomous these agentic workflows become, the larger the attack surface. Prompt injection, indirect data exfiltration, and model jailbreaks are critical vulnerabilities we have to patch on day zero."
    },
    {
        "id": "dev",
        "name": "Dev Bhatia",
        "handle": "@dev.explains",
        "niche": "Tech Explainer & High-Energy Reels",
        "voice": "en-IN-NeerjaNeural",
        "image": "public/characters/dev/master_face_crop.jpg",
        "text": "Boom! That is why the future belongs to builders who write real code, secure the stack, and solve actual human problems. That is the CHATR network blueprint. Hit follow, drop your thoughts below, and we will see you in the next one!"
    }
]

scratch_dir = Path("data/worker_scratch/master_show")
scratch_dir.mkdir(parents=True, exist_ok=True)

async def generate_scene_audio(voice: str, text: str, out_path: str):
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(out_path)

def add_lower_third(video_path: str, name: str, handle: str, niche: str, out_path: str):
    """Adds a stylish semi-transparent broadcast lower-third bar using OpenCV"""
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    temp_v = str(scratch_dir / f"tmp_overlay_{os.path.basename(video_path)}")
    writer = cv2.VideoWriter(temp_v, fourcc, fps, (w, h))
    
    font = cv2.FONT_HERSHEY_DUPLEX
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Draw lower third card in bottom 18% of frame
        overlay = frame.copy()
        card_y = int(h * 0.80)
        card_h = int(h * 0.16)
        cv2.rectangle(overlay, (20, card_y), (w - 20, card_y + card_h), (15, 15, 20), -1)
        cv2.rectangle(overlay, (20, card_y), (28, card_y + card_h), (255, 140, 0), -1) # accent bar
        
        # Blend overlay
        cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)
        
        # Add text
        cv2.putText(frame, name.upper(), (45, card_y + 35), font, 0.75, (255, 255, 255), 2, cv2.LINE_AA)
        cv2.putText(frame, handle, (45, card_y + 60), font, 0.5, (0, 215, 255), 1, cv2.LINE_AA)
        cv2.putText(frame, niche[:40], (45, card_y + 82), font, 0.42, (180, 180, 190), 1, cv2.LINE_AA)
        
        writer.write(frame)
        
    cap.release()
    writer.release()
    
    # Merge audio back
    cmd = [
        "ffmpeg", "-y",
        "-i", temp_v,
        "-i", video_path,
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-map", "0:v:0", "-map", "1:a:0",
        "-shortest",
        out_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(temp_v):
        os.remove(temp_v)

async def main():
    print("=======================================================================")
    print("🎬 PRODUCING CHATR 3-MINUTE 10-CREATOR GLOBAL ENSEMBLE SHOW")
    print("=======================================================================")
    
    scene_videos = []
    
    for idx, scene in enumerate(SHOW_SCRIPT):
        print(f"\n--- Scene {idx+1}/10: {scene['name']} ({scene['handle']}) ---")
        audio_file = str(scratch_dir / f"scene_{idx}_{scene['id']}.mp3")
        raw_video_file = str(scratch_dir / f"scene_{idx}_{scene['id']}_raw.mp4")
        final_scene_file = str(scratch_dir / f"scene_{idx}_{scene['id']}_final.mp4")
        
        # 1. Synthesize Voice
        print(f"🎙️ Generating voice: {scene['voice']}...")
        await generate_scene_audio(scene["voice"], scene["text"], audio_file)
        
        # 2. Render Lip-Sync Video
        print(f"👄 Rendering facial lip-sync with mouth articulation...")
        _render_local_lipsync_fallback(
            image_path=scene["image"],
            audio_path=audio_file,
            output_path=raw_video_file,
            fps=24
        )
        
        # 3. Add Broadcast Lower-Third Title Overlay
        print(f"📺 Adding broadcast lower-third card...")
        add_lower_third(
            video_path=raw_video_file,
            name=scene["name"],
            handle=scene["handle"],
            niche=scene["niche"],
            out_path=final_scene_file
        )
        
        if os.path.exists(final_scene_file):
            scene_videos.append(final_scene_file)
            print(f"✅ Scene {idx+1} complete: {final_scene_file}")
            
    # 4. Concatenate all 10 scenes
    print("\n🎞️ Concatenating all 10 creator scenes into Master 3-Minute Show...")
    concat_list_file = str(scratch_dir / "concat_list.txt")
    with open(concat_list_file, "w") as f:
        for sv in scene_videos:
            abs_sv = os.path.abspath(sv).replace("\\", "/")
            f.write(f"file '{abs_sv}'\n")
            
    master_dest_1 = "public/videos/meera/master_network_3min_show.mp4"
    master_dest_2 = "public/chatr/live_generated/master_network_3min_show.mp4"
    
    cmd_concat = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list_file,
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        master_dest_1
    ]
    subprocess.run(cmd_concat, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    shutil.copy(master_dest_1, master_dest_2)
    
    # 5. Measure Duration & Motion
    cap = cv2.VideoCapture(master_dest_1)
    frames_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration_sec = frames_count / fps if fps else 0.0
    cap.release()
    
    print("\n=======================================================================")
    print(f"🎉 MASTER 3-MINUTE 10-CREATOR SHOW FULLY PRODUCED!")
    print(f"   Destination: {master_dest_1}")
    print(f"   Total Frames: {frames_count}")
    print(f"   FPS: {fps}")
    print(f"   Duration: {duration_sec:.1f} seconds ({duration_sec/60:.2f} minutes)")
    print("=======================================================================")

if __name__ == "__main__":
    asyncio.run(main())
