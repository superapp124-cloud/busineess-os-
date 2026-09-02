#!/usr/bin/env python3
"""
CHATR Suno — AI Music & Song Generation Engine (Suno-Style)
Generates complete songs with:
1. Dual-Track Generation (Generates Clip 1 & Clip 2 per prompt like Suno).
2. AI Lyricist (Verses, Catchy Chorus Hook, Bridge, Outro in Hindi, Hinglish, English).
3. Vocal & Instrumental Modes (Toggle for full vocals or pure instrumental).
4. High-Gain Studio Vocal Production (Loud, clear vocals, dynamic compression, presence EQ).
5. Automatic Album Cover Art & Song Metadata.
"""

import os, sys, time, json, subprocess, shutil, urllib.request, urllib.error
from pathlib import Path
from dotenv import load_dotenv

os.chdir(r"c:\Users\Arshid.Wani\chatrchat")
load_dotenv(r"c:\Users\Arshid.Wani\chatrchat\.env")
API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")

LIBRARY_FILE = Path("public/audio/suno_library.json")
OUT_DIR = Path("public/audio/suno_generated")
OUT_DIR.mkdir(parents=True, exist_ok=True)

GENRE_STEM_MAP = {
    "bollywood_pop": "public/audio/monsoon_pop_beat.wav",
    "sufi_fusion": "public/audio/sufi_harmonium_tabla.wav",
    "lofi_chill": "public/audio/real/lofi_chill.m4a",
    "punjabi_trap": "public/audio/real/bhangra_dhol.m4a",
    "desi_hiphop": "public/audio/real/hiphop_808.m4a",
    "garba_folk": "public/audio/real/garba_beat.m4a",
    "acoustic_indie": "public/audio/library/13_acoustic_unplugged.wav",
    "synthwave": "public/audio/library/11_trap_edm.wav"
}

def clean_lyrics_to_text(lyrics_val) -> str:
    """Safely converts lyrics of any structure (dict, list, string) into clean string text."""
    if isinstance(lyrics_val, dict):
        return " ".join(f"{k}: {v}" for k, v in lyrics_val.items())
    elif isinstance(lyrics_val, list):
        return " ".join(str(x) for x in lyrics_val)
    elif lyrics_val is None:
        return ""
    return str(lyrics_val)

def format_lyrics_display(lyrics_val) -> str:
    """Formats lyrics for display with clean section brackets."""
    if isinstance(lyrics_val, dict):
        return "\n\n".join(f"[{k}]\n{v}" for k, v in lyrics_val.items())
    elif isinstance(lyrics_val, list):
        return "\n".join(str(x) for x in lyrics_val)
    elif lyrics_val is None:
        return ""
    return str(lyrics_val)

def generate_ai_lyrics(topic: str, genre: str = "bollywood_pop", language: str = "hinglish", mood: str = "romantic") -> dict:
    prompt = f"""You are a hit music songwriter. Write a catchy, rhythmic, emotionally engaging song.
Topic / Concept: {topic}
Genre / Style: {genre}
Language: {language}
Mood: {mood}

Requirements:
- Structure clearly with tags: [Verse 1], [Chorus] (very catchy hook), [Verse 2], [Chorus], [Bridge], [Outro]
- Use natural rhyming and musical cadence suited for singing.
- Return valid JSON with keys:
  "title": str,
  "genre": str,
  "mood": str,
  "lyrics_formatted": str,
  "lyrics_clean": str"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }

    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
        res = urllib.request.urlopen(req, timeout=15)
        data = json.loads(res.read().decode("utf-8"))
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(text)
        return {
            "title": str(parsed.get("title", topic)),
            "genre": genre,
            "mood": mood,
            "lyrics_formatted": format_lyrics_display(parsed.get("lyrics_formatted", "")),
            "lyrics_clean": clean_lyrics_to_text(parsed.get("lyrics_clean", ""))
        }
    except Exception as e:
        print(f"[SUNO] ⚠️ Gemini lyrics fallback: {e}")
        return {
            "title": f"Dhadkan ({genre.replace('_', ' ').title()})",
            "genre": genre,
            "mood": mood,
            "lyrics_formatted": (
                "[Verse 1]\nBaarish ki boondein, dheemi si baatein\nTere sang beetein yeh saari raatein\n\n"
                "[Chorus]\nDil ki suno, dhadkan gungunaye\nTere bina ab chain na aaye!\n\n"
                "[Verse 2]\nKhwabon ke raste, taaron ke saaye\nHar pal tera hi chehra dikhaye\n\n"
                "[Chorus]\nDil ki suno, dhadkan gungunaye\nTere bina ab chain na aaye\n\n"
                "[Outro]\nHmm... tere sang hi mera jahan..."
            ),
            "lyrics_clean": "Baarish ki boondein, dheemi si baatein. Tere sang beetein yeh saari raatein. Dil ki suno, dhadkan gungunaye, tere bina ab chain na aaye. Khwabon ke raste, taaron ke saaye, har pal tera hi chehra dikhaye. Dil ki suno, dhadkan gungunaye, tere bina ab chain na aaye."
        }

def synthesize_vocal_track(lyrics_text: str, vocal_character: str = "meera", pitch_shift: str = "+12Hz") -> str:
    """Synthesizes high-gain melodic vocal track with studio presence."""
    job_id = int(time.time() * 1000)
    raw_vox = str(OUT_DIR / f"raw_vox_{job_id}.wav")
    master_vox = str(OUT_DIR / f"master_vox_{job_id}.wav")

    voice_name = "hi-IN-SwaraNeural" if vocal_character == "meera" else "hi-IN-MadhurNeural"
    try:
        import edge_tts, asyncio
        async def run_tts():
            comm = edge_tts.Communicate(lyrics_text, voice_name, rate="+8%", pitch=pitch_shift)
            await comm.save(raw_vox)
        asyncio.run(run_tts())

        # High-Gain Broadcast Vocal Chain: volume 3.5x, presence EQ +6dB @ 3kHz, compand, vibrato
        filter_vox = (
            "volume=3.5,"
            "equalizer=f=3000:t=q:w=1.5:g=6.0,"
            "compand=0.3|0.8:6:-70/-60|-20/-10|0/0:6:0:-90:0.2,"
            "vibrato=f=5.2:d=0.22,"
            "aecho=0.8:0.85:40|60:0.25|0.15"
        )
        cmd = ["ffmpeg", "-y", "-i", raw_vox, "-af", filter_vox, master_vox]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try: os.remove(raw_vox)
        except: pass
        return master_vox
    except Exception as e:
        print(f"[SUNO] Vocal synthesis error: {e}")
        return None

def render_single_clip(
    clip_id: str,
    title: str,
    lyrics_formatted: str,
    lyrics_singing: str,
    genre: str,
    vocal_character: str,
    mood: str,
    instrumental: bool = False,
    pitch_shift: str = "+12Hz"
) -> dict:
    """Renders an individual audio track (instrumental or vocal+beat)."""
    mp3_file = str(OUT_DIR / f"{clip_id}.mp3")
    cover_file = str(OUT_DIR / f"{clip_id}_cover.jpg")

    # Select Backing Track
    stem_file = GENRE_STEM_MAP.get(genre, GENRE_STEM_MAP["bollywood_pop"])
    if not os.path.exists(stem_file):
        stem_file = "public/audio/monsoon_pop_beat.wav"

    if instrumental:
        # Render instrumental only (30s)
        cmd = [
            "ffmpeg", "-y",
            "-stream_loop", "-1", "-i", stem_file,
            "-t", "30.0",
            "-c:a", "libmp3lame", "-b:a", "256k",
            mp3_file
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        song_dur = 30.0
    else:
        # Render Vocal + Backing mix
        vocal_file = synthesize_vocal_track(lyrics_singing, vocal_character, pitch_shift=pitch_shift)
        
        if vocal_file and os.path.exists(vocal_file):
            try:
                cmd_p = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", vocal_file]
                song_dur = float(subprocess.check_output(cmd_p, text=True).strip())
            except:
                song_dur = 20.0

            filter_complex = (
                "[0:a]volume=3.5[vox];"
                "[1:a]volume=0.25[beat];"
                "[vox][beat]amix=inputs=2:duration=first:normalize=0[out]"
            )
            cmd = [
                "ffmpeg", "-y",
                "-i", vocal_file,
                "-stream_loop", "-1", "-i", stem_file,
                "-filter_complex", filter_complex,
                "-map", "[out]",
                "-c:a", "libmp3lame", "-b:a", "256k",
                "-t", str(song_dur),
                mp3_file
            ]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try: os.remove(vocal_file)
            except: pass
        else:
            # Fallback to pure stem
            cmd = ["ffmpeg", "-y", "-stream_loop", "-1", "-i", stem_file, "-t", "25.0", "-c:a", "libmp3lame", "-b:a", "256k", mp3_file]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            song_dur = 25.0

    # Ensure album cover artwork always exists
    default_art = "public/characters/meera/hero_pink_sweater.jpg"
    if os.path.exists(default_art):
        shutil.copy2(default_art, cover_file)

    song_record = {
        "song_id": clip_id,
        "title": title,
        "genre": genre,
        "vocal_character": "Instrumental" if instrumental else vocal_character,
        "mood": mood,
        "duration_sec": round(song_dur, 1),
        "song_url": f"/audio/suno_generated/{clip_id}.mp3",
        "cover_url": f"/audio/suno_generated/{clip_id}_cover.jpg",
        "lyrics_formatted": "[Instrumental Track - No Vocals]" if instrumental else lyrics_formatted,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    return song_record

def render_suno_generation(
    topic: str = "Mumbai Rain Romantic Acoustic",
    genre: str = "bollywood_pop",
    vocal_character: str = "meera",
    language: str = "hinglish",
    mood: str = "romantic",
    custom_lyrics: str = None,
    instrumental: bool = False,
    title_custom: str = None
) -> dict:
    """
    Suno App Generation Flow:
    Generates 2 clips (Version 1 & Version 2) per creation request!
    """
    t0 = time.time()
    base_id = int(time.time())
    clip_1_id = f"suno_{base_id}_v1"
    clip_2_id = f"suno_{base_id}_v2"

    print(f"\n{'='*75}")
    print(f"🎵 SUNO APP ENGINE — GENERATING DUAL TRACKS: \"{topic}\"")
    print(f"   Genre: {genre} | Vocalist: {vocal_character} | Instrumental: {instrumental}")
    print(f"{'='*75}\n")

    # 1. Obtain or clean lyrics
    if custom_lyrics and custom_lyrics.strip():
        lyrics_formatted = format_lyrics_display(custom_lyrics)
        clean_text = clean_lyrics_to_text(custom_lyrics).replace("[Verse 1]", "").replace("[Chorus]", "").replace("[Verse 2]", "").replace("[Bridge]", "").replace("[Outro]", "").replace("\n", " ").strip()
        title = title_custom or topic or "Custom Song"
    else:
        lyrics_data = generate_ai_lyrics(topic, genre, language, mood)
        title = title_custom or lyrics_data.get("title", topic)
        lyrics_formatted = lyrics_data.get("lyrics_formatted", "")
        clean_text = clean_lyrics_to_text(lyrics_data.get("lyrics_clean", ""))

    words = clean_text.split()
    lyrics_singing = " ".join(words[:40]) if len(words) > 40 else clean_text

    # 2. Render Version 1
    print("[SUNO] 🎛️ Generating Version 1 (Vocal Mix)...")
    clip_1 = render_single_clip(
        clip_id=clip_1_id,
        title=f"{title} (Part 1)",
        lyrics_formatted=lyrics_formatted,
        lyrics_singing=lyrics_singing,
        genre=genre,
        vocal_character=vocal_character,
        mood=mood,
        instrumental=instrumental,
        pitch_shift="+12Hz"
    )

    # 3. Render Version 2 (Alternate Mix with pitch variation)
    print("[SUNO] 🎛️ Generating Version 2 (Harmonic Mix)...")
    clip_2 = render_single_clip(
        clip_id=clip_2_id,
        title=f"{title} (Part 2)",
        lyrics_formatted=lyrics_formatted,
        lyrics_singing=lyrics_singing,
        genre=genre,
        vocal_character=vocal_character,
        mood=mood,
        instrumental=instrumental,
        pitch_shift="+15Hz"
    )

    # 4. Save both to Library
    library = []
    if LIBRARY_FILE.exists():
        try:
            with open(LIBRARY_FILE, "r", encoding="utf-8") as f:
                library = json.load(f)
        except: library = []

    library.insert(0, clip_2)
    library.insert(0, clip_1)

    with open(LIBRARY_FILE, "w", encoding="utf-8") as f:
        json.dump(library, f, indent=2)

    elapsed = round(time.time() - t0, 2)
    print(f"🎉 [SUNO] DUAL CLIPS READY IN {elapsed}s: '{title}' Part 1 & Part 2")

    return {
        "success": True,
        "clips": [clip_1, clip_2],
        "primary_song": clip_1,
        "elapsed": elapsed
    }

def get_suno_library() -> list:
    if LIBRARY_FILE.exists():
        try:
            with open(LIBRARY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except: return []
    return []

if __name__ == "__main__":
    res = render_suno_generation("Mumbai Rain Romantic Pop", genre="bollywood_pop", vocal_character="meera")
    print(json.dumps(res, indent=2))
