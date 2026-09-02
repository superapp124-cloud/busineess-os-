"""
CHATR Virtual Creator — Python Shot Planner
Mirror of ShotPlannerEngine.ts for use by master_pipeline.py
"""

import random


LOCATION_BG_QUERIES = {
    "lajpat_nagar_market": ["india market street crowded", "delhi market vendors colorful", "indian bazaar walking people"],
    "saket_cafe": ["india cafe interior warm lighting", "coffee shop cozy india", "cafe people working india"],
    "delhi_metro": ["metro train india inside commute", "subway station india", "train india passengers"],
    "connaught_place": ["delhi city center walking", "india urban street shopping", "connaught place india"],
    "noida_sector_18": ["india mall exterior modern", "shopping center india", "urban india commercial street"],
    "mumbai_bandra": ["mumbai street india", "india coastal city walking", "mumbai urban bandra"],
    "bangalore_brigade_road": ["bangalore india street", "south india modern street", "india tech city urban"],
    "home_room": ["india bedroom cozy interior", "india interior living room warm", "warm room interior india"],
    "office_corridor": ["india office interior", "corporate office india hallway", "office india modern"],
    "street_unknown": ["india street people walking", "indian city street busy", "india urban life street"]
}


def get_bg_query(location, shot_index):
    queries = LOCATION_BG_QUERIES.get(location, ["india street people", "india city urban", "india market"])
    return queries[shot_index % len(queries)]


def get_wan_prompt(character_id, meeraAction, cameraStyle, backgroundType):
    return f"{character_id} {meeraAction.replace('_', ' ')} {cameraStyle.replace('_', ' ')} camera, {backgroundType}, natural lighting, social media vertical video, 9:16"

def get_seed(video_id, shot_num):
    return hash(f"{video_id}_{shot_num}") & 0xFFFFFFFF

def build_shot_plan_py(video_id, mode, location, script, characters, character_id="meera_kapoor"):
    sentences = [s.strip() for s in __import__('re').split(r'[।.!?]+', script) if len(s.strip()) > 10]
    shots = []
    
    char_id = character_id or "meera_kapoor"

    if mode in ("TALK", "COMMENT_REPLY", "STORYTIME", "NEWS_REACTION"):
        shots = [
            {"shotNumber": 1, "durationSec": 3, "cameraStyle": "wide_establishing", "meeraAction": "entering_location", "backgroundVideoQuery": get_bg_query(location, 0), "backgroundType": f"{location} — hook", "dialogue": "", "emotionalBeat": "excited", "charactersPresent": [], "motionNotes": "Natural camera movement. Background has ambient motion.", "transitionOut": "cut", "character_id": char_id, "b_roll": False, "lipsync_required": False},
            {"shotNumber": 2, "durationSec": 5, "cameraStyle": "selfie_handheld", "meeraAction": "talking_to_camera_selfie", "backgroundVideoQuery": get_bg_query(location, 1), "backgroundType": f"{location} — reaction", "dialogue": sentences[0] if sentences else "", "emotionalBeat": "amused", "charactersPresent": [], "motionNotes": "Meera's expression changes mid-shot.", "transitionOut": "cut", "character_id": char_id, "b_roll": False, "lipsync_required": True},
            {"shotNumber": 3, "durationSec": 4, "cameraStyle": "close_up", "meeraAction": "reacting_to_something", "backgroundVideoQuery": get_bg_query(location, 2), "backgroundType": f"{location} — walking", "dialogue": sentences[1] if len(sentences) > 1 else "", "emotionalBeat": "conspiratorial", "charactersPresent": [], "motionNotes": "Background scrolls, natural camera shake while walking.", "transitionOut": "cut", "character_id": char_id, "b_roll": False, "lipsync_required": True},
            {"shotNumber": 4, "durationSec": 5, "cameraStyle": "tracking", "meeraAction": "walking_toward_camera", "backgroundVideoQuery": get_bg_query(location, 3), "backgroundType": f"{location} — payoff", "dialogue": sentences[2] if len(sentences) > 2 else "", "emotionalBeat": "deadpan", "charactersPresent": [], "motionNotes": "One eyebrow up. Holds eye contact.", "transitionOut": "fade", "character_id": char_id, "b_roll": False, "lipsync_required": True},
            {"shotNumber": 5, "durationSec": 4, "cameraStyle": "pov", "meeraAction": "looking_around", "backgroundVideoQuery": get_bg_query(location, 4), "backgroundType": f"{location} — environment", "dialogue": "", "emotionalBeat": "neutral", "charactersPresent": [], "motionNotes": "Environment only.", "transitionOut": "cut", "character_id": char_id, "b_roll": True, "lipsync_required": False},
            {"shotNumber": 6, "durationSec": 5, "cameraStyle": "medium_fixed", "meeraAction": "looking_skeptical", "backgroundVideoQuery": get_bg_query(location, 5), "backgroundType": f"{location} — reaction", "dialogue": sentences[3] if len(sentences) > 3 else "", "emotionalBeat": "skeptical", "charactersPresent": [], "motionNotes": "Second opinion.", "transitionOut": "cut", "character_id": char_id, "b_roll": False, "lipsync_required": True},
            {"shotNumber": 7, "durationSec": 5, "cameraStyle": "phone_cam", "meeraAction": "talking_to_camera_selfie", "backgroundVideoQuery": get_bg_query(location, 6), "backgroundType": f"{location} — payoff", "dialogue": sentences[-1] if sentences else "", "emotionalBeat": "excited", "charactersPresent": [], "motionNotes": "Call to action.", "transitionOut": "fade", "character_id": char_id, "b_roll": False, "lipsync_required": True},
        ]

    elif mode in ("REACTION",):
        shots = [
            {"shotNumber": 1, "durationSec": 3, "cameraStyle": "wide_establishing", "meeraAction": "entering_location", "backgroundVideoQuery": get_bg_query(location, 0), "backgroundType": f"{location} — establishing", "dialogue": "", "emotionalBeat": "surprised", "charactersPresent": [], "motionNotes": "Meera walks INTO frame.", "transitionOut": "cut", "character_id": char_id, "b_roll": False, "lipsync_required": False},
            {"shotNumber": 2, "durationSec": 5, "cameraStyle": "selfie_handheld", "meeraAction": "talking_to_camera_selfie", "backgroundVideoQuery": get_bg_query(location, 1), "backgroundType": f"{location} — setup", "dialogue": sentences[0] if sentences else "", "emotionalBeat": "amused", "charactersPresent": [], "motionNotes": "Natural handheld.", "transitionOut": "cut", "character_id": char_id, "b_roll": False, "lipsync_required": True},
            {"shotNumber": 3, "durationSec": 4, "cameraStyle": "close_up", "meeraAction": "looking_surprised", "backgroundVideoQuery": get_bg_query(location, 2), "backgroundType": f"{location} — reaction", "dialogue": sentences[1] if len(sentences) > 1 else "", "emotionalBeat": "surprised", "charactersPresent": [], "motionNotes": "Eyes wide.", "transitionOut": "cut", "character_id": char_id, "b_roll": False, "lipsync_required": True},
            {"shotNumber": 4, "durationSec": 5, "cameraStyle": "tracking", "meeraAction": "walking_toward_camera", "backgroundVideoQuery": get_bg_query(location, 3), "backgroundType": f"{location} — take", "dialogue": sentences[2] if len(sentences) > 2 else "", "emotionalBeat": "deadpan", "charactersPresent": [], "motionNotes": "Calm delivery.", "transitionOut": "cut", "character_id": char_id, "b_roll": False, "lipsync_required": True},
            {"shotNumber": 5, "durationSec": 4, "cameraStyle": "pov", "meeraAction": "looking_around", "backgroundVideoQuery": get_bg_query(location, 4), "backgroundType": f"{location} — environment", "dialogue": "", "emotionalBeat": "neutral", "charactersPresent": [], "motionNotes": "B-roll.", "transitionOut": "cut", "character_id": char_id, "b_roll": True, "lipsync_required": False},
            {"shotNumber": 6, "durationSec": 5, "cameraStyle": "medium_fixed", "meeraAction": "laughing", "backgroundVideoQuery": get_bg_query(location, 5), "backgroundType": f"{location} — reaction", "dialogue": sentences[3] if len(sentences) > 3 else "", "emotionalBeat": "amused", "charactersPresent": [], "motionNotes": "Reaction.", "transitionOut": "cut", "character_id": char_id, "b_roll": False, "lipsync_required": True},
            {"shotNumber": 7, "durationSec": 5, "cameraStyle": "phone_cam", "meeraAction": "talking_to_camera_selfie", "backgroundVideoQuery": get_bg_query(location, 6), "backgroundType": f"{location} — payoff", "dialogue": sentences[-1] if sentences else "", "emotionalBeat": "amused", "charactersPresent": [], "motionNotes": "Payoff.", "transitionOut": "fade", "character_id": char_id, "b_roll": False, "lipsync_required": True},
        ]

    else:
        # Default vlog style (7 shots)
        camera_styles = ["wide_establishing", "selfie_handheld", "close_up", "tracking", "pov", "medium_fixed", "phone_cam"]
        for i in range(7):
            b_roll = (i == 4)
            dialogue = sentences[i] if (i < len(sentences) and not b_roll) else ""
            shots.append({
                "shotNumber": i + 1, 
                "durationSec": 4 if i % 2 == 0 else 5, 
                "cameraStyle": camera_styles[i], 
                "meeraAction": "looking_around" if b_roll else "talking_to_camera_selfie", 
                "backgroundVideoQuery": get_bg_query(location, i), 
                "backgroundType": f"{location} — shot {i+1}", 
                "dialogue": dialogue, 
                "emotionalBeat": "excited", 
                "charactersPresent": [], 
                "motionNotes": "Motion.", 
                "transitionOut": "fade" if i == 6 else "cut",
                "character_id": char_id,
                "b_roll": b_roll,
                "lipsync_required": bool(dialogue)
            })

    for s in shots:
        s["wan_prompt"] = get_wan_prompt(s["character_id"], s["meeraAction"], s["cameraStyle"], s["backgroundType"])
        s["seed"] = get_seed(video_id, s["shotNumber"])

    total_sec = sum(s["durationSec"] for s in shots)
    errors = []
    if len(shots) < 7:
        errors.append("FAIL: fewer than 7 shots")
    if total_sec < 24:
        errors.append("FAIL: duration too short")

    return {
        "videoId": video_id,
        "totalDurationSec": total_sec,
        "mode": mode,
        "location": location,
        "shots": shots,
        "validationErrors": errors
    }
