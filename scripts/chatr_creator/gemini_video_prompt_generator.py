#!/usr/bin/env python3
"""
CHATR — Direct Google Veo 3.1 Custom Video Synthesizer
Generates 100% fresh, unique video footage for every prompt with customizable:
- Location / Place
- Outfit / Wardrobe
- Ambience / Lighting
- Camera Motion & Expressions
"""

import os, sys, time, json, subprocess, shutil
from pathlib import Path

os.chdir(r"c:\Users\Arshid.Wani\chatrchat")

def generate_director_prompt(
    topic: str,
    character: str = "meera",
    place: str = "street_food",
    ambience: str = "golden_hour",
    wardrobe: str = "denim_urban",
    camera_style: str = "handheld_vlog",
    emotion: str = "viral_humor",
    platform: str = "instagram_reel",
    duration_sec: int = 30,
    language: str = "hinglish"
) -> dict:
    """
    Synthesizes a tailored visual prompt directly reflecting the user's prompt topic, location, wardrobe, and ambience.
    """
    # Dynamic Place Description based on topic and place input
    topic_lower = topic.lower() if topic else ""
    
    if "paris" in topic_lower:
        place_desc = "the charming streets of Paris near the Eiffel Tower with classic Parisian architecture, quaint outdoor cafes, and cobblestone pavements"
    elif "tokyo" in topic_lower or "japan" in topic_lower:
        place_desc = "a vibrant Tokyo Shinjuku street with colorful Japanese storefronts, neon signs, and lively pedestrian atmosphere"
    elif "park" in topic_lower or "nature" in topic_lower or "garden" in topic_lower:
        place_desc = "a sun-dappled European botanical garden with blooming flowers, emerald lawns, and classical stone fountains"
    elif "beach" in topic_lower or "ocean" in topic_lower:
        place_desc = "a scenic tropical coastal boardwalk with turquoise waves, golden sand, and gentle palm trees"
    elif "cafe" in topic_lower or "coffee" in topic_lower:
        place_desc = "an aesthetic modern specialty cafe with rustic wood tables, warm fairy lights, and artisan espresso bar"
    elif "delhi" in topic_lower or "chandni" in topic_lower:
        place_desc = "a bustling Chandni Chowk Old Delhi market with rich cultural spices, textile shops, and vibrant heritage lanes"
    elif "new york" in topic_lower or "nyc" in topic_lower:
        place_desc = "a sunny Manhattan New York City avenue with yellow taxicabs, brownstone buildings, and iconic city skyline"
    else:
        places_dict = {
            "street_food": "a bustling Asian street food night market with sizzling woks, food carts, and colorful hanging lanterns",
            "delhi_market": "a vibrant Delhi cultural market with rich heritage colors and festive street lighting",
            "nyc_times_square": "Times Square New York City with glowing digital billboards and modern urban energy",
            "aesthetic_cafe": "a cozy aesthetic modern cafe with warm wooden tables and lush green plants",
            "tech_studio": "a sleek modern AI tech podcast studio with subtle acoustic lighting and minimalist design",
            "luxury_rooftop": "a luxury glass rooftop overlooking an illuminated evening city skyline",
            "tokyo_neon": "a vibrant Tokyo neon alleyway in Shinjuku with lantern lights and gentle reflections",
            "nature_park": "a sunny green botanical park with lush trees and golden sun rays"
        }
        place_desc = places_dict.get(place, f"the vibrant scenic surroundings of {topic}")

    # Dynamic Wardrobe Description
    wardrobe_dict = {
        "denim_urban": "wearing a stylish blue denim jacket over a white top with minimalist silver hoop earrings",
        "vibrant_ethnic": "wearing a gorgeous saffron and emerald Indian designer fusion outfit with delicate jewellery",
        "sleek_black": "wearing a sophisticated tailored black blazer with modern chic accessories",
        "pastel_hoodie": "wearing a trendy oversized lavender streetwear hoodie and sneakers",
        "leather_chic": "wearing a stylish dark leather biker jacket with a casual graphic tee",
        "summer_dress": "wearing a breezy floral yellow summer sundress with sunlit natural style"
    }
    wardrobe_desc = wardrobe_dict.get(wardrobe, wardrobe_dict["denim_urban"])

    # Ambience Description
    ambience_dict = {
        "golden_hour": "warm golden hour sunset lighting with soft amber lens flare and glowing natural skin tones",
        "neon_cyber": "electric cyan and magenta cyberpunk neon illumination with vivid high-contrast reflections",
        "bright_daylight": "crisp clean 5600K natural sunlight, balanced natural shadows, and vibrant realistic colors",
        "moody_cinematic": "moody cinematic lighting with artistic key illumination and rich shadows",
        "pastel_warm": "soft pastel color grading with diffused creamy lighting and gentle tones"
    }
    ambience_desc = ambience_dict.get(ambience, ambience_dict["golden_hour"])

    aspect_ratio = "9:16" if platform in ("instagram_reel", "tiktok", "shorts") else "16:9"

    # Construct clean prompt for Veo 3.1 (descriptive, passes safety filter)
    visual_prompt = (
        f"Cinematic 4k {aspect_ratio} video of a cheerful 23-year-old Indian woman content creator with warm brown skin, "
        f"expressive brown eyes, long wavy dark brown hair, {wardrobe_desc}, exploring {place_desc}. "
        f"{ambience_desc}. Dynamic handheld phone vlogging camera movement, natural eye contact, authentic human skin texture, "
        f"expressive facial micro-dynamics, high detail, 24fps cinematic motion."
    )

    # Dynamic Script
    if language == "hindi":
        script = f"नमस्ते दोस्तों! आज हम आ चुके हैं {topic} में! यहाँ का माहौल सच में बहुत खूबसूरत और अनोखा है। आप लोग क्या सोचते हैं, कमेंट्स में ज़रूर बताओ!"
    elif language == "english":
        script = f"Hey everyone! Welcome to {topic}! Look at this breathtaking view and atmosphere around me. It feels so surreal to be here today. Let me know your thoughts in the comments and subscribe for more adventures!"
    else: # Hinglish
        script = f"Hey guys! Today we are exploring {topic}! Yahan ka vibe literally unforgettable hai. Look at how gorgeous everything looks. Aapko kaisa laga, comments mein batao and don't forget to follow!"

    return {
        "topic": topic,
        "character": "Meera Kapoor",
        "place": place,
        "place_desc": place_desc,
        "ambience": ambience,
        "wardrobe": wardrobe,
        "aspect_ratio": aspect_ratio,
        "duration_sec": duration_sec,
        "language": language,
        "visual_prompt": visual_prompt,
        "script": script
    }

def generate_video_from_prompt(prompt_data: dict, mode: str = "vlog", output_path: str = None) -> dict:
    """
    Directly submits prompt to Google Veo 3.1 to generate brand new, unique diffusion video.
    """
    try:
        from gemini_veo_engine import generate_veo_video
    except ImportError:
        from scripts.chatr_creator.gemini_veo_engine import generate_veo_video
        
    visual_p = prompt_data.get("visual_prompt", "Cinematic video of Indian woman creator talking in Paris")
    ratio = prompt_data.get("aspect_ratio", "9:16")
    
    print(f"\n[DIRECTOR] 🚀 Submitting to Google Veo 3.1: \"{visual_p[:80]}...\"")
    res = generate_veo_video(prompt=visual_p, aspect_ratio=ratio, output_mp4=output_path)
    
    if res.get("success"):
        # Add synchronized speech audio to the freshly generated video
        try:
            import edge_tts, asyncio
            raw_video = f"public{res['video_url']}"
            voice_out = raw_video.replace(".mp4", "_voice.mp3")
            muxed_out = raw_video.replace(".mp4", "_master.mp4")
            
            script_text = prompt_data.get("script", "")
            voice_lang = "en-IN-NeerjaNeural" if prompt_data.get("language") == "english" else "hi-IN-SwaraNeural"
            
            async def run_tts():
                comm = edge_tts.Communicate(script_text, voice_lang, rate="+3%")
                await comm.save(voice_out)
            asyncio.run(run_tts())
            
            cmd = [
                "ffmpeg", "-y", "-i", raw_video, "-i", voice_out,
                "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                "-map", "0:v:0", "-map", "1:a:0", "-shortest",
                muxed_out
            ]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if os.path.exists(muxed_out):
                shutil.move(muxed_out, raw_video)
                try: os.remove(voice_out)
                except: pass
        except Exception as e:
            print(f"[DIRECTOR] Voice mux warning: {e}")
            
    res["prompt_data"] = prompt_data
    return res

if __name__ == "__main__":
    p = generate_director_prompt("Paris Eiffel Tower Tour", wardrobe="pastel_hoodie", ambience="golden_hour")
    print(json.dumps(p, indent=2))
