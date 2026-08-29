"""
CHATR Virtual Creator — Dry Run #003
Batch Producer for 10 Complete Entertainment Episodes

Fulfills all Dry Run #003 requirements:
- 10 distinct entertainment episodes
- 5 locations (min 3)
- 5 outfits (min 3)
- 6 emotional states (min 3)
- 2 supporting characters (Priya, Arjun - min 2)
- 2 walking scenes (Ep 2, Ep 7 - min 2)
- 2 reaction scenes (Ep 1, Ep 6 - min 2)
- 1 comedy scene (Ep 3 - min 1)
- 2 dance/performance/sing scenes (Ep 5, Ep 10 - min 1)
- 1 comment-reply scene (Ep 4 - min 1)
- All 10 required assets per episode
"""

import os
import sys
import json
import time
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))

from master_pipeline import produce_episode

EPISODES_SPEC = [
    {
        "num": 1,
        "mode": "REACTION",
        "location": "saket_cafe",
        "outfit": "casual_mustard_kurti",
        "characters": [],
        "trend": {
            "topic": "The OTT thriller climax that broke the internet",
            "category": "bollywood_ott",
            "source": "Reddit India r/bollywood",
            "discoveredAt": datetime.now().isoformat(),
            "trendAgeHours": 8,
            "velocity": "peak",
            "audienceFitScore": 94,
            "contentAngle": "Okay so listen... main kal raat yeh climax dekhi and I was not ready!",
            "keyPhrases": ["OTT", "thriller", "climax", "plot twist", "binge"],
            "relatedHashtags": ["#OTT", "#bollywood", "#thriller", "#delhi", "#meera"]
        }
    },
    {
        "num": 2,
        "mode": "WALK_AND_TALK",
        "location": "lajpat_nagar_market",
        "outfit": "street_denim_offwhite",
        "characters": [],
        "trend": {
            "topic": "Delhi vs Mumbai street food debate: The momo supremacy",
            "category": "food_culture",
            "source": "Instagram Trending India",
            "discoveredAt": datetime.now().isoformat(),
            "trendAgeHours": 14,
            "velocity": "rising",
            "audienceFitScore": 96,
            "contentAngle": "Momos are spiritually important. Main Delhi market se live report de rahi hoon.",
            "keyPhrases": ["momos", "street food", "Delhi", "Lajpat Nagar", "taste"],
            "relatedHashtags": ["#delhistreetfood", "#momos", "#lajpatnagar", "#foodie", "#delhi"]
        }
    },
    {
        "num": 3,
        "mode": "COMEDY",
        "location": "connaught_place",
        "outfit": "teal_ethnic_coord",
        "characters": ["arjun"],
        "trend": {
            "topic": "When your friend acts like an expert on everything",
            "category": "relationships_humor",
            "source": "Reddit India r/indiasocial",
            "discoveredAt": datetime.now().isoformat(),
            "trendAgeHours": 20,
            "velocity": "rising",
            "audienceFitScore": 92,
            "contentAngle": "Arjun claims he predicted the entire tech industry in 2018. Sure, Arjun.",
            "keyPhrases": ["friend", "overconfident", "comedy", "delhi", "arguments"],
            "relatedHashtags": ["#friends", "#relatable", "#comedy", "#delhigirl", "#connaughtplace"]
        }
    },
    {
        "num": 4,
        "mode": "COMMENT_REPLY",
        "location": "delhi_metro",
        "outfit": "casual_mustard_kurti",
        "characters": [],
        "trend": {
            "topic": "Audience comment: 'Meera talks too fast and has zero patience'",
            "category": "comment_reply",
            "source": "Viewer Comment on Ep 2",
            "discoveredAt": datetime.now().isoformat(),
            "trendAgeHours": 6,
            "velocity": "peak",
            "audienceFitScore": 98,
            "contentAngle": "Someone commented that I talk too fast. Have you ever tried boarding Rajiv Chowk metro?",
            "keyPhrases": ["metro", "delhi metro", "patience", "rajiv chowk", "comments"],
            "relatedHashtags": ["#delhimetro", "#rajivchowk", "#commentreply", "#creatorlife", "#delhi"]
        }
    },
    {
        "num": 5,
        "mode": "DANCE",
        "location": "mumbai_bandra",
        "outfit": "evening_black_chic",
        "characters": [],
        "trend": {
            "topic": "Viral Indian pop hook that is taking over every reel",
            "category": "indian_music",
            "source": "YouTube Trending India",
            "discoveredAt": datetime.now().isoformat(),
            "trendAgeHours": 10,
            "velocity": "peak",
            "audienceFitScore": 95,
            "contentAngle": "I told myself I wouldn't do this dance. I lied to myself.",
            "keyPhrases": ["dance", "viral beat", "pop hook", "choreography", "music"],
            "relatedHashtags": ["#dancechallenge", "#viralreels", "#indianmusic", "#bandra", "#energy"]
        }
    },
    {
        "num": 6,
        "mode": "REACTION",
        "location": "saket_cafe",
        "outfit": "rust_red_salwar",
        "characters": [],
        "trend": {
            "topic": "The most unhinged luxury wedding trend on Instagram",
            "category": "viral_meme",
            "source": "Instagram Explore",
            "discoveredAt": datetime.now().isoformat(),
            "trendAgeHours": 18,
            "velocity": "rising",
            "audienceFitScore": 91,
            "contentAngle": "People are hiring helicopter paparazzi for weddings now. Meanwhile my tea just got cold.",
            "keyPhrases": ["wedding", "desi weddings", "unhinged", "reaction", "luxury"],
            "relatedHashtags": ["#indianwedding", "#weddingseason", "#desi", "#reaction", "#funny"]
        }
    },
    {
        "num": 7,
        "mode": "WALK_AND_TALK",
        "location": "lajpat_nagar_market",
        "outfit": "street_denim_offwhite",
        "characters": [],
        "trend": {
            "topic": "Delhi monsoon rain: Expectations vs Reality",
            "category": "street_culture",
            "source": "Twitter / X Trending Delhi",
            "discoveredAt": datetime.now().isoformat(),
            "trendAgeHours": 4,
            "velocity": "peak",
            "audienceFitScore": 97,
            "contentAngle": "Monsoon in Bollywood: romantic violin. Monsoon in Delhi: why is there a lake outside my PG?",
            "keyPhrases": ["monsoon", "delhi baarish", "chai", "expectations vs reality", "waterlogging"],
            "relatedHashtags": ["#delhimonsoon", "#baarish", "#chai", "#delhilife", "#relatable"]
        }
    },
    {
        "num": 8,
        "mode": "TALK",
        "location": "home_room",
        "outfit": "casual_mustard_kurti",
        "characters": ["priya"],
        "trend": {
            "topic": "Priya and Meera: Weekend plans gone completely wrong",
            "category": "relationships_humor",
            "source": "Creator Continuity / Lore",
            "discoveredAt": datetime.now().isoformat(),
            "trendAgeHours": 24,
            "velocity": "rising",
            "audienceFitScore": 93,
            "contentAngle": "We said a quiet dinner. How did we end up stranded at 2 AM looking for ice cream?",
            "keyPhrases": ["bestie", "priya", "storytime", "weekend", "chaos"],
            "relatedHashtags": ["#storytime", "#besties", "#friendshipgoals", "#delhi", "#meera"]
        }
    },
    {
        "num": 9,
        "mode": "NEWS_REACTION",
        "location": "connaught_place",
        "outfit": "teal_ethnic_coord",
        "characters": [],
        "trend": {
            "topic": "Unusual celebrity red carpet fashion at the big awards",
            "category": "fashion_lifestyle",
            "source": "Film Companion / YouTube",
            "discoveredAt": datetime.now().isoformat(),
            "trendAgeHours": 16,
            "velocity": "rising",
            "audienceFitScore": 90,
            "contentAngle": "I thrift my clothes for 300 rupees. Explain this 8-lakh gown that looks like bubble wrap.",
            "keyPhrases": ["red carpet", "fashion", "awards", "thrift", "celebrity"],
            "relatedHashtags": ["#fashionpolice", "#celebritystyle", "#thriftfirst", "#delhigirl", "#review"]
        }
    },
    {
        "num": 10,
        "mode": "SING",
        "location": "mumbai_bandra",
        "outfit": "evening_black_chic",
        "characters": [],
        "trend": {
            "topic": "Late-night acoustic vocal performance to soulful Hindi melody",
            "category": "indian_music",
            "source": "Spotify India Viral Top 50",
            "discoveredAt": datetime.now().isoformat(),
            "trendAgeHours": 12,
            "velocity": "peak",
            "audienceFitScore": 96,
            "contentAngle": "Late night acoustic session. Pure melody, no autotune, just vibes.",
            "keyPhrases": ["singing", "acoustic", "hindi melody", "vocal", "soulful"],
            "relatedHashtags": ["#acousticsong", "#singing", "#hindisong", "#music", "#latenightvibes"]
        }
    }
]


def run_batch_production():
    print("=" * 70)
    print("🌟 CHATR VIRTUAL CREATOR — DRY RUN #003 PRODUCTION RUN")
    print("   Target: 10 Complete Entertainment Episodes")
    print("   Persistent Identity: Meera (@meera_wtf)")
    print("   OAuth: OFF | Publishing: OFF | Zero-Cost Local Generation")
    print("=" * 70)

    results = []
    start_all = time.time()

    for spec in EPISODES_SPEC:
        num = spec["num"]
        print(f"\n[{num}/10] Launching Episode {num} Production...")
        res = produce_episode(
            episode_num=num,
            trend=spec["trend"],
            mode=spec["mode"],
            location=spec["location"],
            outfit=spec["outfit"],
            characters=spec["characters"]
        )
        results.append(res)

    total_time = round(time.time() - start_all, 1)
    passed_count = sum(1 for r in results if r.get("qualityGatePassed"))

    print("\n" + "=" * 70)
    print(f"🏁 DRY RUN #003 BATCH PRODUCTION COMPLETE in {total_time}s")
    print(f"   Episodes Produced: {len(results)}/10")
    print(f"   Quality Gate Passed: {passed_count}/{len(results)}")
    print("=" * 70)

    summary_file = "public/chatr/dryrun003/dryrun003_manifest.json"
    manifest = {
        "batch": "DRY_RUN_003",
        "creator": "Meera (@meera_wtf)",
        "completedAt": datetime.now().isoformat(),
        "totalEpisodes": len(results),
        "qualityGatePassedCount": passed_count,
        "publishingEnabled": False,
        "oauthEnabled": False,
        "episodes": results
    }
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Manifest written to: {summary_file}")
    return manifest


if __name__ == "__main__":
    run_batch_production()
