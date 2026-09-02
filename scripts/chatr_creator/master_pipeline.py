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
from character_registry import get_character, get_available_characters
from human_writing_gate import analyze_script
from trend_intelligence import get_all_trends, get_content_batch
from music_selector import select_music, get_ffmpeg_mix_command

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


def run_quality_gate(episode_dir: str, script: str, shot_count: int, writing_analysis: dict = None) -> dict:
    """Run automated quality checks."""
    checks = []
    fail_reasons = []

    # Check video exists
    video_ok = os.path.exists(os.path.join(episode_dir, "video.mp4"))
    checks.append({"name": "video.mp4 exists", "passed": video_ok, "measured": True})
    if not video_ok: fail_reasons.append("video.mp4 missing")

    # Check shot count >= 7 for 30s social video standard
    shots_ok = shot_count >= 7
    checks.append({"name": f"Shot count ≥ 7 (got {shot_count})", "passed": shots_ok, "measured": True})
    if not shots_ok: fail_reasons.append(f"Only {shot_count} shots — below 7-shot minimum for 30s social video")

    # Check human writing gate analysis
    if writing_analysis is None:
        writing_analysis = analyze_script(script)
    
    writing_passed = writing_analysis.get("status") == "PASS"
    checks.append({
        "name": f"Human writing score ≥ 70 (got {writing_analysis.get('humanity_score', 0)})",
        "passed": writing_passed,
        "measured": True,
        "note": writing_analysis.get("reject_reason")
    })
    if not writing_passed:
        fail_reasons.append(f"Human writing gate failed: {writing_analysis.get('reject_reason')}")

    # Face similarity — NOT MEASURED until Wan/SSIM GPU verification
    checks.append({"name": "Face consistency (SSIM ≥ 0.82)", "passed": False, "measured": False,
                   "note": "NOT MEASURED — manual review required"})

    # Lip sync — NOT MEASURED until MuseTalk execution
    checks.append({"name": "Lip sync offset < 200ms", "passed": False, "measured": False,
                   "note": "NOT MEASURED — manual review required"})

    return {
        "checks": checks,
        "passed": len(fail_reasons) == 0,
        "failReasons": fail_reasons,
        "writingAnalysis": writing_analysis,
        "warningReasons": ["Face consistency not measured — requires GPU SSIM",
                           "Lip sync not measured — requires MuseTalk worker"],
        "humanReviewRequired": True,
        "humanReviewNotes": [
            "Watch the full video on a mobile screen.",
            "Ask: 'Does this look like a real Indian creator Reel?'",
            "Check: Does character look consistent across shots?",
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
    character_id: str = "meera",
    character_video_path: str = None,
    characters: list = None
) -> dict:
    """Produce one complete episode using verified components."""
    video_id = f"{character_id}_ep{episode_num:03d}_{int(time.time())}"
    episode_dir = os.path.join(OUTPUT_BASE, f"episode_{episode_num:02d}")
    os.makedirs(episode_dir, exist_ok=True)

    char_profile = get_character(character_id)

    print(f"\n{'='*60}")
    print(f"🎬 EPISODE {episode_num}: {trend['topic'][:50]}")
    print(f"   Character: {char_profile.name} ({char_profile.asset_status}) | Mode: {mode} | Location: {location}")
    print(f"{'='*60}")

    # 1. Generate script
    print("\n📝 Generating script...")
    script = try_ollama_script(trend["topic"], trend.get("category", "viral_trend"), char_profile.personality)
    if not script:
        script = generate_script_from_template(trend.get("category", "viral_trend"), trend["topic"], trend.get("contentAngle", ""))
    print(f"   Script ({len(script.split())} words): {script[:80]}...")

    # 2. Human Writing Gate Analysis
    print("\n🧐 Running Human Writing Gate...")
    writing_analysis = analyze_script(script)
    print(f"   Humanity Score: {writing_analysis.get('humanity_score')}/100 | Status: {writing_analysis.get('status')}")

    # 3. Build shot plan (minimum 7 shots, 30s target)
    print("\n🎞️  Planning shots...")
    from shot_planner_py import build_shot_plan_py
    shot_plan = build_shot_plan_py(video_id, mode, location, script, characters or [], character_id=character_id)
    shot_count = len(shot_plan["shots"])
    print(f"   {shot_count} shots planned (Target duration: {shot_plan['totalDurationSec']}s)")

    # 4. Save shot plan
    shot_plan_path = os.path.join(episode_dir, "shot-plan.json")
    with open(shot_plan_path, 'w', encoding='utf-8') as f:
        json.dump(shot_plan, f, indent=2, ensure_ascii=False)

    # 5. Generate voice
    print("\n🔊 Generating voice...")
    voice_path = os.path.join(episode_dir, "voice.mp3")
    try:
        voice_meta = generate_voice(script, voice_path, voice_override=char_profile.voice_id)
        print(f"   Voice: {voice_meta['estimated_duration_sec']}s, {voice_meta['word_count']} words")
    except Exception as e:
        print(f"   ❌ Voice generation failed: {e}")
        return {"error": str(e), "episode": episode_num}

    # 6. Generate captions
    captions_path = os.path.join(episode_dir, "captions.srt")
    generate_captions_srt(voice_meta.get("word_timings", []), captions_path)

    # 7. Select Music Track
    music_meta = select_music(trend.get("category", "default"), shot_plan["totalDurationSec"])
    print(f"   🎵 Music Selected: {music_meta.get('title')} ({music_meta.get('genre')}, BPM: {music_meta.get('bpm')})")

    # 8. Download / Select backgrounds
    bg_map = download_all_shot_backgrounds(shot_plan, os.path.join(episode_dir, "backgrounds"))

    # 9. Assemble video
    try:
        ffmpeg = find_ffmpeg()
        if ffmpeg and bg_map:
            print("\n🎬 Assembling video...")
            assembly = assemble_video(
                video_id=video_id,
                shot_plan=shot_plan,
                bg_map=bg_map,
                voice_path=voice_path,
                character_video_path=character_video_path,
                output_dir=episode_dir
            )
            print(f"   ✅ Video: {assembly['videoPath']}")
        else:
            print("\n⚠️  FFmpeg not available — skipping video assembly")
            print("   Install FFmpeg to enable video generation")
    except Exception as e:
        print(f"   ❌ Assembly error: {e}")

    # 10. Save all assets
    script_data = {"script": script, "wordCount": len(script.split()), "mode": mode, "videoId": video_id}
    with open(os.path.join(episode_dir, "script.json"), 'w', encoding='utf-8') as f:
        json.dump(script_data, f, indent=2, ensure_ascii=False)

    seo = generate_seo_package(trend["topic"], script, trend)
    with open(os.path.join(episode_dir, "seo.json"), 'w', encoding='utf-8') as f:
        json.dump(seo, f, indent=2, ensure_ascii=False)

    trend_data = {**trend, "episodeNumber": episode_num, "mode": mode, "location": location}
    with open(os.path.join(episode_dir, "trend.json"), 'w', encoding='utf-8') as f:
        json.dump(trend_data, f, indent=2, ensure_ascii=False)

    char_dict = {
        "character_id": char_profile.character_id,
        "name": char_profile.name,
        "personality": char_profile.personality,
        "voice_id": char_profile.voice_id,
        "canonical_face_path": char_profile.canonical_face_path,
        "asset_status": char_profile.asset_status,
        "outfit": outfit,
        "location": location
    }
    with open(os.path.join(episode_dir, "character.json"), 'w', encoding='utf-8') as f:
        json.dump(char_dict, f, indent=2, ensure_ascii=False)

    # 11. Run quality gate
    quality = run_quality_gate(episode_dir, script, shot_count, writing_analysis=writing_analysis)
    with open(os.path.join(episode_dir, "quality-report.json"), 'w', encoding='utf-8') as f:
        json.dump(quality, f, indent=2, ensure_ascii=False)

    status = "✅ GATE_PASSED" if quality["passed"] else "❌ GATE_FAILED"
    print(f"\n{status}")
    if quality["failReasons"]:
        for r in quality["failReasons"]:
            print(f"   FAIL: {r}")

    return {
        "episodeNumber": episode_num,
        "videoId": video_id,
        "character": char_profile.name,
        "characterStatus": char_profile.asset_status,
        "episodeDir": episode_dir,
        "script": script[:100],
        "shotsPlanned": shot_count,
        "qualityGatePassed": quality["passed"],
        "state": quality["state"]
    }


if __name__ == "__main__":
    print("CHATR Virtual Creator — Live Pipeline Orchestrator")
    print("=" * 60)

    # Fetch live trends from Google News / Trends / Reddit
    print("\n📡 Ingesting live trend signals...")
    trends = get_content_batch(n=5)
    if trends and trends[0].source != "FALLBACK":
        active_trend = {
            "topic": trends[0].topic,
            "category": trends[0].category,
            "source": trends[0].source,
            "discoveredAt": trends[0].timestamp,
            "trendAgeHours": trends[0].freshness_hours,
            "velocity": trends[0].velocity,
            "audienceFitScore": trends[0].audience_fit,
            "contentAngle": f"Reaction to {trends[0].topic}",
            "keyPhrases": [trends[0].category, "trending", "india"],
            "relatedHashtags": [f"#{trends[0].category}", "#india", "#trending"]
        }
        print(f"✅ Live Trend Discovered: {active_trend['topic']} (Source: {active_trend['source']})")
    else:
        active_trend = {
            "topic": "The momo supremacy debate in Delhi markets",
            "category": "food_culture",
            "source": "FALLBACK_EVERGREEN",
            "discoveredAt": datetime.now().isoformat(),
            "trendAgeHours": 0.5,
            "velocity": "TRENDING_NOW",
            "audienceFitScore": 95,
            "contentAngle": "Momos are spiritually important. Delhi street food review.",
            "keyPhrases": ["momos", "delhi", "foodie"],
            "relatedHashtags": ["#delhistreetfood", "#momos", "#delhi"]
        }
        print(f"⚠️ Using Evergreen Trend: {active_trend['topic']}")

    result = produce_episode(
        episode_num=1,
        trend=active_trend,
        mode="REACTION",
        location="saket_cafe",
        outfit="casual_mustard_kurti",
        character_id="meera",
        characters=[]
    )

    print(f"\n{'='*60}")
    print("Episode Result:")
    print(json.dumps(result, indent=2))

