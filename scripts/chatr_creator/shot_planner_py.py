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


def build_shot_plan_py(video_id, mode, location, script, characters):
    sentences = [s.strip() for s in __import__('re').split(r'[।.!?]+', script) if len(s.strip()) > 10]

    shots = []

    if mode in ("TALK", "COMMENT_REPLY", "STORYTIME", "NEWS_REACTION"):
        shots = [
            {"shotNumber": 1, "durationSec": 3, "cameraStyle": "selfie_handheld", "meeraAction": "talking_to_camera_selfie", "backgroundVideoQuery": get_bg_query(location, 0), "backgroundType": f"{location} — hook", "dialogue": sentences[0] if sentences else "", "emotionalBeat": "excited", "charactersPresent": [], "motionNotes": "Natural camera movement. Background has ambient motion.", "transitionOut": "cut"},
            {"shotNumber": 2, "durationSec": 5, "cameraStyle": "close_up_reaction", "meeraAction": "reacting_to_something", "backgroundVideoQuery": get_bg_query(location, 1), "backgroundType": f"{location} — reaction", "dialogue": sentences[1] if len(sentences) > 1 else "", "emotionalBeat": "amused", "charactersPresent": [], "motionNotes": "Meera's expression changes mid-shot.", "transitionOut": "cut"},
            {"shotNumber": 3, "durationSec": 6, "cameraStyle": "selfie_handheld", "meeraAction": "walking_toward_camera", "backgroundVideoQuery": get_bg_query(location, 2), "backgroundType": f"{location} — walking", "dialogue": sentences[2] if len(sentences) > 2 else "", "emotionalBeat": "conspiratorial", "charactersPresent": [], "motionNotes": "Background scrolls, natural camera shake while walking.", "transitionOut": "cut"},
            {"shotNumber": 4, "durationSec": 5, "cameraStyle": "medium_shot_fixed", "meeraAction": "looking_skeptical", "backgroundVideoQuery": get_bg_query(location, 3), "backgroundType": f"{location} — payoff", "dialogue": sentences[-1] if sentences else "", "emotionalBeat": "deadpan", "charactersPresent": [], "motionNotes": "One eyebrow up. Holds eye contact.", "transitionOut": "fade"},
        ]

    elif mode in ("REACTION",):
        shots = [
            {"shotNumber": 1, "durationSec": 2, "cameraStyle": "wide_establishing", "meeraAction": "entering_location", "backgroundVideoQuery": get_bg_query(location, 0), "backgroundType": f"{location} — establishing", "dialogue": "", "emotionalBeat": "surprised", "charactersPresent": [], "motionNotes": "Meera walks INTO frame.", "transitionOut": "cut"},
            {"shotNumber": 2, "durationSec": 4, "cameraStyle": "selfie_handheld", "meeraAction": "talking_to_camera_selfie", "backgroundVideoQuery": get_bg_query(location, 1), "backgroundType": f"{location} — setup", "dialogue": sentences[0] if sentences else "", "emotionalBeat": "amused", "charactersPresent": [], "motionNotes": "Natural handheld. Meera shifts weight mid-shot.", "transitionOut": "cut"},
            {"shotNumber": 3, "durationSec": 4, "cameraStyle": "close_up_reaction", "meeraAction": "looking_surprised", "backgroundVideoQuery": get_bg_query(location, 2), "backgroundType": f"{location} — reaction", "dialogue": sentences[1] if len(sentences) > 1 else "", "emotionalBeat": "surprised", "charactersPresent": [], "motionNotes": "Eyes wide. Hand to mouth.", "transitionOut": "cut"},
            {"shotNumber": 4, "durationSec": 5, "cameraStyle": "selfie_handheld", "meeraAction": "talking_to_camera_selfie", "backgroundVideoQuery": get_bg_query(location, 3), "backgroundType": f"{location} — take", "dialogue": sentences[2] if len(sentences) > 2 else "", "emotionalBeat": "deadpan", "charactersPresent": [], "motionNotes": "Calm delivery. Opinion stated clearly.", "transitionOut": "cut"},
            {"shotNumber": 5, "durationSec": 4, "cameraStyle": "close_up_reaction", "meeraAction": "laughing", "backgroundVideoQuery": get_bg_query(location, 4), "backgroundType": f"{location} — payoff", "dialogue": sentences[-1] if sentences else "", "emotionalBeat": "amused", "charactersPresent": [], "motionNotes": "Meera laughs or shakes head.", "transitionOut": "fade"},
        ]

    elif mode == "COMEDY" and characters:
        char = characters[0]
        shots = [
            {"shotNumber": 1, "durationSec": 3, "cameraStyle": "wide_establishing", "meeraAction": "entering_location", "backgroundVideoQuery": get_bg_query(location, 0), "backgroundType": f"{location}", "dialogue": "", "emotionalBeat": "warm", "charactersPresent": [], "motionNotes": "Scene set.", "transitionOut": "cut"},
            {"shotNumber": 2, "durationSec": 5, "cameraStyle": "medium_shot_fixed", "meeraAction": "talking_to_character", "backgroundVideoQuery": get_bg_query(location, 1), "backgroundType": f"{location}", "dialogue": sentences[0] if sentences else "", "emotionalBeat": "amused", "charactersPresent": [char], "motionNotes": "Meera gestures while talking.", "transitionOut": "cut"},
            {"shotNumber": 3, "durationSec": 4, "cameraStyle": "close_up_reaction", "meeraAction": "reacting_to_something", "backgroundVideoQuery": get_bg_query(location, 2), "backgroundType": f"{location}", "dialogue": sentences[1] if len(sentences) > 1 else "", "emotionalBeat": "surprised", "charactersPresent": [char], "motionNotes": "Character says something. Meera reacts.", "transitionOut": "cut"},
            {"shotNumber": 4, "durationSec": 5, "cameraStyle": "selfie_handheld", "meeraAction": "talking_to_camera_selfie", "backgroundVideoQuery": get_bg_query(location, 3), "backgroundType": f"{location}", "dialogue": sentences[-1] if sentences else "", "emotionalBeat": "deadpan", "charactersPresent": [], "motionNotes": "Meera looks at camera. Delivers punchline.", "transitionOut": "fade"},
        ]

    elif mode == "SING":
        shots = [
            {"shotNumber": 1, "durationSec": 4, "cameraStyle": "medium_shot_fixed", "meeraAction": "singing", "backgroundVideoQuery": get_bg_query(location, 0), "backgroundType": f"{location} — performance", "dialogue": sentences[0] if sentences else "", "emotionalBeat": "warm", "charactersPresent": [], "motionNotes": "Meera sings. Slight body sway.", "transitionOut": "cut"},
            {"shotNumber": 2, "durationSec": 5, "cameraStyle": "close_up_reaction", "meeraAction": "singing", "backgroundVideoQuery": get_bg_query(location, 1), "backgroundType": f"{location} — close", "dialogue": sentences[1] if len(sentences) > 1 else "", "emotionalBeat": "nostalgic", "charactersPresent": [], "motionNotes": "Close on face. Emotional line.", "transitionOut": "cross_dissolve"},
            {"shotNumber": 3, "durationSec": 5, "cameraStyle": "selfie_handheld", "meeraAction": "singing", "backgroundVideoQuery": get_bg_query(location, 2), "backgroundType": f"{location} — wide", "dialogue": sentences[2] if len(sentences) > 2 else "", "emotionalBeat": "excited", "charactersPresent": [], "motionNotes": "She moves with the song.", "transitionOut": "cut"},
            {"shotNumber": 4, "durationSec": 4, "cameraStyle": "close_up_reaction", "meeraAction": "laughing", "backgroundVideoQuery": get_bg_query(location, 3), "backgroundType": f"{location} — end beat", "dialogue": "", "emotionalBeat": "warm", "charactersPresent": [], "motionNotes": "Final note held. Meera smiles naturally at camera.", "transitionOut": "fade"},
        ]

    else:
        # Default vlog style
        for i, sentence in enumerate(sentences[:5]):
            shots.append({"shotNumber": i + 1, "durationSec": 5, "cameraStyle": "selfie_handheld" if i % 2 == 0 else "close_up_reaction", "meeraAction": "talking_to_camera_selfie" if i % 3 != 1 else "reacting_to_something", "backgroundVideoQuery": get_bg_query(location, i), "backgroundType": f"{location} — shot {i+1}", "dialogue": sentence, "emotionalBeat": "excited", "charactersPresent": [], "motionNotes": "Character in motion or expression change.", "transitionOut": "fade" if i == len(sentences[:5]) - 1 else "cut"})

    total_sec = sum(s["durationSec"] for s in shots)
    errors = []
    if len(shots) < 4:
        errors.append("FAIL: fewer than 4 shots")

    return {
        "videoId": video_id,
        "totalDurationSec": total_sec,
        "mode": mode,
        "location": location,
        "shots": shots,
        "validationErrors": errors
    }
