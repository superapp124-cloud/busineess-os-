"""
CHATR Virtual Creator — Master Pipeline Orchestrator
Coordinates all components to produce a complete video asset bundle.

Pipeline:
  1. Trend Discovery (live, public web)
  2. Script Generation (via Ollama local LLM or template)
  3. Shot Planning
  4. Voice Synthesis (edge-tts)
  5. Background Download (Pixabay CC0)
  6. Video Assembly (FFmpeg)
  7. Quality Gate (automated checks)
  8. Package all assets

Output per video:
  video.mp4, thumbnail.jpg, script.json, voice.mp3,
  captions.srt, seo.json, trend.json, character.json,
  shot-plan.json, quality-report.json
"""

import asyncio
import json
import os
import subprocess
import sys
import time
import uuid
from pathlib import Path
from datetime import datetime


# Add scripts dir to path
sys.path.insert(0, str(Path(__file__).parent))

from voice_pipeline import generate_voice, generate_captions_srt
from background_fetcher import download_all_shot_backgrounds
from video_assembler import assemble_video, find_ffmpeg

OUTPUT_BASE = "public/chatr/dryrun003"
CHARACTER_JSON_PATH = "public/characters/meera/identity.json"


# ============================================================
# MEERA IDENTITY (local reference — loaded from JSON if exists)
# ============================================================

MEERA_IDENTITY = {
    "name": "Meera",
    "handle": "@meera_wtf",
    "voice": "hi-IN-SwaraNeural",
    "masterImagePath": "/characters/meera/master_face.jpg",
    "catchphrases": [
        "Okay so listen—",
        "Be honest with me.",
        "Yaar sach mein?",
        "This is genuinely insane to me.",
        "Matlab seriously?"
    ],
    "personalityNote": "Delhi girl, 23, warm + dry wit, Hinglish, not corporate"
}

# ============================================================
# SCRIPT TEMPLATES (used when Ollama unavailable)
# These sound like Meera — not AI copy
# ============================================================

SCRIPT_TEMPLATES = {
    "bollywood_ott": [
        "Okay so listen— yaar maine kal raat ek cheez dekhi aur main literally so nahi payi. {topic_phrase}. Main samajhna chahti hoon — kya sirf mujhe aisa lag raha hai ya sach mein yeh itna crazy hai? Koi toh batao.",
        "Main ek cheez poochti hoon. Bas ek. {topic_phrase} ke baare mein kisi ne mujhe kyun nahi bataya. Mera poora weekend barbad ho gaya. No complaints. Just facts.",
    ],
    "food_culture": [
        "Theek hai toh. Main confess karti hoon. {topic_phrase} ke baare mein meri ek bohot strong opinion hai aur main jaanti hoon log agree nahi karenge. But hear me out.",
        "Maine aaj kuch khaya. It changed my understanding of what food can be. I'm being dramatic but I'm also not. {topic_phrase}. That's all I'm going to say.",
    ],
    "relationships_humor": [
        "Something happened. Main details nahi bataungi. {topic_phrase}. Bas itna batao — agar aap mere jagah hote toh kya karte? Seriously. Kyunki main abhi completely lost hoon.",
        "Meri ek friend ne mujhe yeh story sunaayi aur tab se main is baare mein soch rahi hoon. {topic_phrase}. Yeh toh galat tha na? Confirm karo please.",
    ],
    "viral_meme": [
        "Okay the internet has done something again. {topic_phrase}. And I have been staring at this for twenty minutes and I cannot decide if it's brilliant or completely unhinged. Maybe both.",
        "{topic_phrase}. Someone explain this to me slowly. Like I'm five. Kyunki main genuinely samajh nahi rahi.",
    ],
    "indian_music": [
        "This song has been in my head for three days now. {topic_phrase}. Be honest with me — is it actually good or have we all just heard it too many times? Because I cannot tell anymore.",
        "Okay I don't know who made {topic_phrase} but they need to be stopped. In the best possible way. Main serious hoon.",
    ],
    "street_culture": [
        "Main aaj market mein thi. {topic_phrase}. And I realized something that I think is very specific to living here. Like you'd only understand if you've actually been.",
        "{topic_phrase}. Yeh toh hona hi tha honestly. Delhi is very much Delhi today.",
    ],
    "weird_news": [
        "I saw something in the news today. {topic_phrase}. And I have questions. Specifically: how? And also: why? And also: who decided this was okay?",
        "Okay so {topic_phrase}. This happened. And nobody is talking about it enough. Main alone nahi hoon na in thinking this is insane?",
    ],
    "comment_reply": [
        "Someone in the comments said — and I am quoting — {topic_phrase}. Okay. Fine. I'm going to respond to this properly because apparently I need to.",
        "Okay so {topic_phrase} — yeh comment aya tha pichle video pe. And I've been thinking about how to respond. Here is my answer. Ready?",
    ]
}


def generate_script_from_template(category: str, topic: str, content_angle: str) -> str:
    """
    Generate a natural-sounding Hinglish script for Meera.
    Uses templates when Ollama unavailable.
    """
    import random
    templates = SCRIPT_TEMPLATES.get(category, SCRIPT_TEMPLATES["weird_news"])
    template = random.choice(templates)

    topic_phrase = topic[:80]
    script = template.replace("{topic_phrase}", topic_phrase)

    # Add content angle as hook if different from template
    if content_angle and len(content_angle) > 20:
        script = content_angle + " " + script

    return script


def try_ollama_script(topic: str, category: str, personality_note: str) -> str | None:
    """Try to generate script via local Ollama."""
    try:
        import requests
        prompt = f"""You are writing dialogue for Meera, a 23-year-old Delhi creator.
Voice: Hinglish (Hindi + English mix), warm, dry wit, conversational.
NOT corporate, NOT AI-sounding, NOT formal.

Topic: {topic}
Category: {category}
Personality: {personality_note}

Write a 30-second creator video script (about 80-100 words).
Sound like a real person talking to a friend.
Use: interruptions, natural pauses, mild sarcasm, relatable Delhi humor.
DO NOT use: "In today's world", "Let me tell you", "Did you know", "Game-changing".
Start with something interesting — not "Hi guys".

Script:"""

        res = requests.post("http://localhost:11434/api/generate", json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False,
            "options": {"num_predict": 150, "temperature": 0.8}
        }, timeout=30)

        if res.status_code == 200:
            return res.json().get("response", "").strip()
    except Exception:
        pass
    return None


def generate_seo_package(topic: str, script: str, trend: dict) -> dict:
    """Generate SEO metadata without making social content sound like SEO."""
    hashtags = trend.get("relatedHashtags", ["#trending", "#india"])
    return {
        "primarySearchIntent": f"What is happening with {topic}",
        "secondarySearchIntent": f"India reaction {topic}",
        "title": f"Meera reacts: {topic[:60]}",
        "description": f"Meera on {topic}. Watch to the end. | {' '.join(hashtags[:5])}",
        "caption": script[:150] + "...",
        "transcript": script,
        "keywords": trend.get("keyPhrases", []) + ["india", "creator", "meera"],
        "entities": [topic],
        "hashtags": hashtags,
        "websiteOpportunity": f"Article: '{topic} — what people are saying'",
        "note": "SEO package generated separately — social script was NOT modified for SEO"
    }


def run_quality_gate(episode_dir: str, script: str, shot_count: int) -> dict:
    """Run automated quality checks."""
    BANNED = [
        "In today's fast-paced world", "Here's why", "Let me tell you",
        "Did you know", "AI is transforming", "The future is here",
        "Game-changing", "Revolutionary", "Disruptive"
    ]

    checks = []
    fail_reasons = []

    # Check video exists
    video_ok = os.path.exists(os.path.join(episode_dir, "video.mp4"))
    checks.append({"name": "video.mp4 exists", "passed": video_ok, "measured": True})
    if not video_ok: fail_reasons.append("video.mp4 missing")

    # Check shot count
    shots_ok = shot_count >= 4
    checks.append({"name": f"Shot count ≥ 4 (got {shot_count})", "passed": shots_ok, "measured": True})
    if not shots_ok: fail_reasons.append(f"Only {shot_count} shots — static presenter risk")

    # Check script naturalness
    found_phrases = [p for p in BANNED if p.lower() in script.lower()]
    script_ok = len(found_phrases) == 0
    checks.append({"name": "No AI clichés in script", "passed": script_ok, "measured": True,
                   "note": f"Found: {found_phrases}" if found_phrases else None})
    if not script_ok: fail_reasons.append(f"Banned phrases in script: {found_phrases}")

    # Face similarity — NOT MEASURED (no GPU SSIM)
    checks.append({"name": "Face consistency (SSIM ≥ 0.82)", "passed": False, "measured": False,
                   "note": "NOT MEASURED — manual review required"})

    # Lip sync — NOT MEASURED  
    checks.append({"name": "Lip sync offset < 200ms", "passed": False, "measured": False,
                   "note": "NOT MEASURED — manual review required"})

    return {
        "checks": checks,
        "passed": len(fail_reasons) == 0,
        "failReasons": fail_reasons,
        "warningReasons": ["Face consistency not measured — check manually",
                           "Lip sync not measured — check manually"],
        "humanReviewRequired": True,
        "humanReviewNotes": [
            "Watch the full video on a mobile screen.",
            "Ask: 'Does this look like a real Indian creator Reel?'",
            "Check: Does Meera look consistent across shots?",
            "Check: Is voice natural?",
            "Check: Does background have real motion?",
            "APPROVE or REJECT manually."
        ],
        "state": "GATE_CHECKED" if len(fail_reasons) == 0 else "GATE_FAILED"
    }


def produce_episode(
    episode_num: int,
    trend: dict,
    mode: str = "TALK",
    location: str = "delhi_metro",
    outfit: str = "casual_mustard_kurti",
    characters: list = None
) -> dict:
    """Produce one complete episode."""
    video_id = f"meera_ep{episode_num:03d}_{int(time.time())}"
    episode_dir = os.path.join(OUTPUT_BASE, f"episode_{episode_num:02d}")
    os.makedirs(episode_dir, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"🎬 EPISODE {episode_num}: {trend['topic'][:50]}")
    print(f"   Mode: {mode} | Location: {location}")
    print(f"{'='*60}")

    # 1. Generate script
    print("\n📝 Generating script...")
    script = try_ollama_script(trend["topic"], trend["category"], MEERA_IDENTITY["personalityNote"])
    if not script:
        script = generate_script_from_template(trend["category"], trend["topic"], trend.get("contentAngle", ""))
    print(f"   Script ({len(script.split())} words): {script[:80]}...")

    # 2. Build shot plan
    print("\n🎞️  Planning shots...")
    from shot_planner_py import build_shot_plan_py
    shot_plan = build_shot_plan_py(video_id, mode, location, script, characters or [])
    shot_count = len(shot_plan["shots"])
    print(f"   {shot_count} shots planned")

    # 3. Save shot plan
    shot_plan_path = os.path.join(episode_dir, "shot-plan.json")
    with open(shot_plan_path, 'w') as f:
        json.dump(shot_plan, f, indent=2)

    # 4. Generate voice
    print("\n🔊 Generating voice...")
    voice_path = os.path.join(episode_dir, "voice.mp3")
    try:
        voice_meta = generate_voice(script, voice_path)
        print(f"   Voice: {voice_meta['estimated_duration_sec']}s, {voice_meta['word_count']} words")
    except Exception as e:
        print(f"   ❌ Voice generation failed: {e}")
        return {"error": str(e), "episode": episode_num}

    # 5. Generate captions
    captions_path = os.path.join(episode_dir, "captions.srt")
    generate_captions_srt(voice_meta.get("word_timings", []), captions_path)

    # 6. Download backgrounds
    bg_map = download_all_shot_backgrounds(shot_plan, os.path.join(episode_dir, "backgrounds"))

    # 7. Assemble video
    try:
        ffmpeg = find_ffmpeg()
        if ffmpeg and bg_map:
            print("\n🎬 Assembling video...")
            assembly = assemble_video(
                video_id=video_id,
                shot_plan=shot_plan,
                bg_map=bg_map,
                voice_path=voice_path,
                face_video_path=None,  # Wav2Lip phase 2
                output_dir=episode_dir
            )
            print(f"   ✅ Video: {assembly['videoPath']}")
        else:
            print("\n⚠️  FFmpeg not available — skipping video assembly")
            print("   Install FFmpeg to enable video generation")
    except Exception as e:
        print(f"   ❌ Assembly error: {e}")

    # 8. Save all assets
    script_data = {"script": script, "wordCount": len(script.split()), "mode": mode, "videoId": video_id}
    with open(os.path.join(episode_dir, "script.json"), 'w', encoding='utf-8') as f:
        json.dump(script_data, f, indent=2, ensure_ascii=False)

    seo = generate_seo_package(trend["topic"], script, trend)
    with open(os.path.join(episode_dir, "seo.json"), 'w', encoding='utf-8') as f:
        json.dump(seo, f, indent=2, ensure_ascii=False)

    trend_data = {**trend, "episodeNumber": episode_num, "mode": mode, "location": location}
    with open(os.path.join(episode_dir, "trend.json"), 'w', encoding='utf-8') as f:
        json.dump(trend_data, f, indent=2, ensure_ascii=False)

    with open(os.path.join(episode_dir, "character.json"), 'w') as f:
        json.dump({**MEERA_IDENTITY, "outfit": outfit, "location": location}, f, indent=2)

    # 9. Run quality gate
    quality = run_quality_gate(episode_dir, script, shot_count)
    with open(os.path.join(episode_dir, "quality-report.json"), 'w') as f:
        json.dump(quality, f, indent=2)

    status = "✅ GATE_PASSED" if quality["passed"] else "❌ GATE_FAILED"
    print(f"\n{status}")
    if quality["failReasons"]:
        for r in quality["failReasons"]:
            print(f"   FAIL: {r}")

    return {
        "episodeNumber": episode_num,
        "videoId": video_id,
        "episodeDir": episode_dir,
        "script": script[:100],
        "shotsPlanned": shot_count,
        "qualityGatePassed": quality["passed"],
        "state": quality["state"]
    }


if __name__ == "__main__":
    print("CHATR Virtual Creator — Dry Run #003")
    print("=" * 60)

    # Quick single episode test
    sample_trend = {
        "topic": "The new OTT show everyone won't stop talking about",
        "category": "bollywood_ott",
        "source": "SIMULATED_FALLBACK",
        "discoveredAt": datetime.now().isoformat(),
        "trendAgeHours": 12,
        "velocity": "rising",
        "audienceFitScore": 90,
        "contentAngle": "Okay I watched it and I need to talk about this.",
        "keyPhrases": ["OTT", "binge", "review", "watch"],
        "relatedHashtags": ["#OTT", "#webseries", "#india", "#bollywood"]
    }

    result = produce_episode(
        episode_num=1,
        trend=sample_trend,
        mode="REACTION",
        location="saket_cafe",
        outfit="casual_teal_kurta",
        characters=[]
    )

    print(f"\n{'='*60}")
    print("Episode Result:")
    print(json.dumps(result, indent=2))
