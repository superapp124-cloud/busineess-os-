#!/usr/bin/env python3
"""
CHATR — Direct Google Veo 3.1 & Nano Banana Pro Prompt Generator 2.0
Supports rich Props, Outfits, Places, Moods, and Cinematography.
"""

import os, sys, time, json, subprocess, shutil
from pathlib import Path

os.chdir(r"c:\Users\Arshid.Wani\chatrchat")

def generate_director_prompt(
    topic: str,
    character: str = "meera",
    place: str = "paris",
    wardrobe: str = "summer_dress",
    prop: str = "iced_latte",
    mood: str = "cheerful",
    ambience: str = "golden_hour",
    camera_style: str = "handheld_vlog",
    platform: str = "instagram_reel",
    duration_sec: int = 30,
    language: str = "english"
) -> dict:
    """
    Synthesizes a tailored visual prompt directly reflecting the user's prompt topic, location, wardrobe, prop, mood, and ambience.
    """
    topic_lower = topic.lower() if topic else ""

    # 1. PLACES DICTIONARY
    places_dict = {
        "paris": "the charming cobblestone streets of Paris near the Eiffel Tower, with romantic outdoor bistro cafes and ornate Haussmannian balconies",
        "delhi_market": "the vibrant, bustling Chandni Chowk street food bazaar in Old Delhi, with glowing brass lamps, fragrant spice carts, and cultural architecture",
        "tokyo_neon": "a dynamic Tokyo Shinjuku neon-lit alleyway with vivid glowing kanji signs, lantern reflections, and futuristic cyberpunk urban energy",
        "nyc_times_square": "the energetic center of Times Square New York City with towering digital billboards, yellow taxicabs, and iconic Manhattan skyline",
        "aesthetic_cafe": "a warm minimalist aesthetic coffee shop with natural oak tables, soft pendant lights, lush monstera plants, and artisan espresso bar",
        "tech_studio": "a sleek modern AI creator studio with dark acoustic slatted wall panels, warm ambient edge lighting, and minimalist desk setup",
        "goa_beach": "a golden coastal Goa beach boardwalk at sunset, with turquoise rolling waves, gentle palm trees, and warm coastal breeze",
        "swiss_chalet": "a scenic Swiss Alps wooden balcony with breathtaking panoramic views of snow-capped mountains and pine forests",
        "jaipur_palace": "a grand royal Jaipur palace courtyard with intricately carved pink sandstone arches, marble fountains, and majestic heritage lanterns",
        "london_park": "a sunlit London Hyde Park botanical path surrounded by blooming colorful rose gardens and majestic oak trees"
    }
    place_desc = places_dict.get(place, places_dict["paris"])
    if "paris" in topic_lower and place == "street_food":
        place_desc = places_dict["paris"]

    # 2. WARDROBE DICTIONARY
    wardrobe_dict = {
        "summer_dress": "wearing a breezy floral yellow summer sundress with delicate shoulder ties and sunlit natural style",
        "pastel_hoodie": "wearing a trendy oversized lavender streetwear hoodie with minimal typography and clean white sneakers",
        "vibrant_ethnic": "wearing a royal saffron and emerald Indian designer fusion kurti with subtle gold zardozi embroidery and delicate jhumkas",
        "sleek_black": "wearing a tailored modern black tech blazer with structured shoulders, crisp white undershirt, and minimalist gold necklace",
        "denim_urban": "wearing a stylish distressed blue denim trucker jacket over a clean white baby tee with silver hoop earrings",
        "leather_chic": "wearing a sleek dark leather moto jacket with silver zip hardware and a fitted dark graphic tee",
        "cozy_knit": "wearing an oversized warm ivory cashmere turtleneck knit sweater with soft texture",
        "athleisure": "wearing a chic sage-green athleisure crop top and high-waisted seamless leggings",
        "silk_saree": "wearing an elegant crimson and gold Banarasi silk saree with royal cultural poise"
    }
    wardrobe_desc = wardrobe_dict.get(wardrobe, wardrobe_dict["summer_dress"])

    # 3. PROPS DICTIONARY
    props_dict = {
        "iced_latte": "casually holding a clear aesthetic takeaway iced caramel latte with a glass straw",
        "vlog_phone": "holding a sleek titanium smartphone mounted on a mini vlogging tripod with soft ring light",
        "street_food": "holding a steaming bamboo street food box with chopsticks, taking delicious tasting bites",
        "shopping_bags": "carrying stylish luxury boutique pastel shopping bags over one arm",
        "sunglasses": "wearing chic dark gradient designer sunglasses pushed stylishly up onto her hair",
        "headphones": "wearing sleek silver over-ear wireless studio headphones resting around her neck",
        "vintage_camera": "holding an aesthetic vintage silver 35mm film camera with leather neck strap",
        "croissant": "holding a fresh flaky butter croissant from a nearby Parisian bakery",
        "laptop": "working casually with a sleek silver MacBook resting on the wooden table"
    }
    prop_desc = props_dict.get(prop, props_dict["iced_latte"])

    # 4. MOOD & FACIAL EXPRESSION DICTIONARY (Calm, Photorealistic, No Distortions)
    moods_dict = {
        "cheerful": "beaming with a warm confident smile, expressive sparkling eyes, charismatic natural influencer charm, and delightful eye contact",
        "thoughtful": "thoughtful and engaging expression, articulate hand gestures, subtle knowing smile, intellectual poise, and natural head nods",
        "sarcastic": "playful witty expression with a knowing smirk, raised eyebrow, dry humorous delivery, and relatable charismatic energy",
        "awestruck": "wonder-filled expressive gaze, gentle happy smile, head turning gently to take in the breathtaking panoramic surroundings",
        "calm_luxury": "serene composed luxury aesthetic, soft articulate speech dynamics, elegant posture, and relaxed confident presence",
        "high_energy": "vibrant dynamic storytelling energy, expressive conversational hand movements, enthusiastic pacing, and captivating delivery"
    }
    mood_desc = moods_dict.get(mood, moods_dict["cheerful"])

    # 5. AMBIENCE & LIGHTING
    ambience_dict = {
        "golden_hour": "warm golden hour sunset lighting with soft amber rim illumination and glowing natural skin tones",
        "neon_cyber": "electric cyan and magenta cyberpunk neon lighting with vivid specular reflections and cinematic atmosphere",
        "bright_daylight": "crisp clean 5600K natural sunlight, balanced organic shadows, and vibrant realistic colors",
        "moody_cinematic": "moody film noir contrast with rich volumetric shadows, warm key light, and cinematic atmosphere",
        "pastel_warm": "soft pastel creamy lighting with diffused bokeh and gentle flattering highlights"
    }
    ambience_desc = ambience_dict.get(ambience, ambience_dict["golden_hour"])

    aspect_ratio = "9:16" if platform in ("instagram_reel", "tiktok", "shorts") else "16:9"

    # Master Prompts for Google Veo 3.1 & Diffusion
    visual_prompt = (
        f"Cinematic 4K {aspect_ratio} video of a graceful 23-year-old Indian woman content creator with warm brown skin, "
        f"expressive almond brown eyes, and long wavy dark brown hair. She is {wardrobe_desc}, {prop_desc}, exploring {place_desc}. "
        f"She is {mood_desc}, speaking calmly directly to the handheld vlog camera. {ambience_desc}. "
        f"Realistic articulate speech lip movements, steady vlog camera movement, soft depth of field, authentic human skin texture, 24fps cinematic motion."
    )

    # Contextual Dialogue Script
    if language == "hindi":
        script = (
            f"नमस्ते दोस्तों! आज हम आ चुके हैं {topic} में और यह जगह सच में बहुत खूबसूरत है! "
            f"यहाँ का वाइब और यहाँ का कल्चर देख कर दिल खुश हो गया। "
            f"अगर आप यहाँ आ रहे हैं तो यह स्पॉट बिल्कुल मिस मत करना। आप लोग क्या सोचते हैं, कमेंट्स में ज़रूर बताओ!"
        )
    elif language == "english":
        script = (
            f"Hey everyone! Welcome to {topic}! Look at this breathtaking atmosphere and iconic views all around me. "
            f"Exploring these streets has been an absolute dream experience. "
            f"What is your dream travel destination? Let me know in the comments below and subscribe for more adventures!"
        )
    else: # Hinglish
        script = (
            f"Hey guys! Aaj hum explore kar rahe hain {topic} aur trust me, yahan ka vibe literally next level hai! "
            f"Just look at how stunning everything looks around us. "
            f"Aapka favorite spot kaunsa hai? Comments mein batao and follow for more daily vlogs!"
        )

    return {
        "topic": topic,
        "character": "Meera Kapoor",
        "place": place,
        "place_desc": place_desc,
        "wardrobe": wardrobe,
        "wardrobe_desc": wardrobe_desc,
        "prop": prop,
        "prop_desc": prop_desc,
        "mood": mood,
        "mood_desc": mood_desc,
        "ambience": ambience,
        "aspect_ratio": aspect_ratio,
        "duration_sec": duration_sec,
        "language": language,
        "visual_prompt": visual_prompt,
        "script": script
    }

def generate_video_from_prompt(prompt_data: dict, mode: str = "vlog", output_path: str = None) -> dict:
    """
    Submits prompt to Google Veo 3.1 with multi-tier failover and synchronizes neural speech.
    """
    try:
        from gemini_veo_engine import generate_veo_video
    except ImportError:
        from scripts.chatr_creator.gemini_veo_engine import generate_veo_video

    visual_p = prompt_data.get("visual_prompt", "Cinematic video of Indian woman creator talking in Paris")
    ratio = prompt_data.get("aspect_ratio", "9:16")

    print(f"\n[DIRECTOR] 🚀 Submitting to Google Veo 3.1: \"{visual_p[:90]}...\"")
    res = generate_veo_video(prompt=visual_p, aspect_ratio=ratio, output_mp4=output_path)

    if res.get("success"):
        try:
            import edge_tts, asyncio
            raw_video = f"public{res['video_url']}"
            voice_out = raw_video.replace(".mp4", "_voice.mp3")
            muxed_out = raw_video.replace(".mp4", "_master.mp4")

            script_text = prompt_data.get("script", "")
            voice_lang = "en-IN-NeerjaNeural" if prompt_data.get("language") == "english" else "hi-IN-SwaraNeural"

            async def run_tts():
                comm = edge_tts.Communicate(script_text, voice_lang, rate="+2%")
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
    p = generate_director_prompt(
        topic="Paris Eiffel Tower Tour",
        place="paris",
        wardrobe="summer_dress",
        prop="iced_latte",
        mood="cheerful",
        ambience="golden_hour"
    )
    print(json.dumps(p, indent=2))
