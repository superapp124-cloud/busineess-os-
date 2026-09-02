import os
import sys
import json
import argparse
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional

@dataclass
class CharacterProfile:
    character_id: str
    name: str
    age_range: str
    gender: str
    appearance: Dict[str, str]
    personality: str
    speech_style: str
    voice_id: str
    voice_settings: Dict[str, float]
    wan_prompt_prefix: str
    negative_prompt: str
    scene_prompt_templates: Dict[str, str]
    canonical_face_path: Optional[str]
    reference_images: List[str]
    asset_status: str
    identity_version: str

REGISTRY: Dict[str, CharacterProfile] = {
    "priya": CharacterProfile(
        character_id="priya",
        name="Priya Sharma",
        age_range="28-32",
        gender="Female",
        appearance={"hair": "black, shoulder-length, neat", "skin_tone": "medium brown", "wardrobe_profile": "corporate-meets-startup, blazers, smart casual", "body_type": "average"},
        personality="Enterprise AI Strategist, sharp",
        speech_style="Hindi-English bilingual, professional, concise",
        voice_id="en-IN-NeerjaNeural",
        voice_settings={"rate": 1.0, "pitch": 0.0, "volume": 1.0},
        wan_prompt_prefix="A highly realistic cinematic shot of Priya Sharma, 30yo Indian female, sharp corporate look",
        negative_prompt="blurry, animated, cartoon, messy",
        scene_prompt_templates={"talking": "{prefix}, talking confidently about {action} in {location}", "walking": "{prefix}, walking in {location} while {action}", "reacting": "{prefix}, reacting to {action} at {location}", "sitting": "{prefix}, sitting in {location}, {action}"},
        canonical_face_path=None,
        reference_images=[],
        asset_status="PENDING_REFERENCE_IMAGE",
        identity_version="v1.0"
    ),
    "rohan": CharacterProfile(
        character_id="rohan",
        name="Rohan Varma",
        age_range="26-30",
        gender="Male",
        appearance={"hair": "short, slightly messy", "skin_tone": "light brown", "wardrobe_profile": "casual tech bro, solid t-shirts", "body_type": "athletic"},
        personality="Founder/Systems Engineer, casual tech bro energy, builds things, skeptical of hype",
        speech_style="casual, direct",
        voice_id="en-IN-PrabhatNeural",
        voice_settings={"rate": 1.05, "pitch": -0.5, "volume": 1.0},
        wan_prompt_prefix="A highly realistic cinematic shot of Rohan Varma, 28yo Indian male tech founder, casual tech bro style",
        negative_prompt="blurry, animated, cartoon, suit",
        scene_prompt_templates={"talking": "{prefix}, talking casually about {action} in {location}", "walking": "{prefix}, walking in {location} while {action}", "reacting": "{prefix}, reacting to {action} at {location}", "sitting": "{prefix}, sitting in {location}, {action}"},
        canonical_face_path=None,
        reference_images=[],
        asset_status="PENDING_REFERENCE_IMAGE",
        identity_version="v1.0"
    ),
    "ananya": CharacterProfile(
        character_id="ananya",
        name="Ananya Iyer",
        age_range="22-26",
        gender="Female",
        appearance={"hair": "long, curly", "skin_tone": "dark brown", "wardrobe_profile": "arts/culture focus, expressive, boho-chic", "body_type": "petite"},
        personality="Talent/Creative, expressive",
        speech_style="South Indian accent, energetic, artsy",
        voice_id="ta-IN-PallaviNeural",
        voice_settings={"rate": 1.1, "pitch": 0.5, "volume": 1.0},
        wan_prompt_prefix="A highly realistic cinematic shot of Ananya Iyer, 24yo South Indian female, expressive artsy style",
        negative_prompt="blurry, animated, cartoon, stiff",
        scene_prompt_templates={"talking": "{prefix}, talking expressively about {action} in {location}", "walking": "{prefix}, walking in {location} while {action}", "reacting": "{prefix}, reacting to {action} at {location}", "sitting": "{prefix}, sitting in {location}, {action}"},
        canonical_face_path=None,
        reference_images=[],
        asset_status="PENDING_REFERENCE_IMAGE",
        identity_version="v1.0"
    ),
    "vikram": CharacterProfile(
        character_id="vikram",
        name="Vikram Joshi",
        age_range="30-35",
        gender="Male",
        appearance={"hair": "medium length, bearded", "skin_tone": "medium brown", "wardrobe_profile": "flannel, open-source evangelist, intellectual", "body_type": "average"},
        personality="AI/OSS Builder, intellectual, open-source evangelist",
        speech_style="thoughtful, deliberate",
        voice_id="hi-IN-MadhurNeural",
        voice_settings={"rate": 0.95, "pitch": -1.0, "volume": 1.0},
        wan_prompt_prefix="A highly realistic cinematic shot of Vikram Joshi, 32yo bearded Indian male, open-source dev intellectual",
        negative_prompt="blurry, animated, cartoon, clean-shaven",
        scene_prompt_templates={"talking": "{prefix}, explaining {action} in {location}", "walking": "{prefix}, walking in {location} while {action}", "reacting": "{prefix}, reacting to {action} at {location}", "sitting": "{prefix}, sitting in {location}, {action}"},
        canonical_face_path=None,
        reference_images=[],
        asset_status="PENDING_REFERENCE_IMAGE",
        identity_version="v1.0"
    ),
    "ishita": CharacterProfile(
        character_id="ishita",
        name="Ishita Rao",
        age_range="25-30",
        gender="Female",
        appearance={"hair": "straight, tied back", "skin_tone": "fair", "wardrobe_profile": "formal, news presenter style", "body_type": "average"},
        personality="News/Trend Presenter, credible",
        speech_style="anchored delivery, measured pace",
        voice_id="hi-IN-SwaraNeural",
        voice_settings={"rate": 1.0, "pitch": 0.0, "volume": 1.0},
        wan_prompt_prefix="A highly realistic cinematic shot of Ishita Rao, 28yo Indian female, news anchor formal look",
        negative_prompt="blurry, animated, cartoon, casual",
        scene_prompt_templates={"talking": "{prefix}, reporting on {action} in {location}", "walking": "{prefix}, walking in {location} while {action}", "reacting": "{prefix}, reacting to {action} at {location}", "sitting": "{prefix}, sitting in {location}, {action}"},
        canonical_face_path=None,
        reference_images=[],
        asset_status="PENDING_REFERENCE_IMAGE",
        identity_version="v1.0"
    ),
    "meera": CharacterProfile(
        character_id="meera",
        name="Meera Kapoor",
        age_range="23",
        gender="Female",
        appearance={"hair": "wavy, long", "skin_tone": "fair", "wardrobe_profile": "Delhi Gen-Z, stylish, warm", "body_type": "slim"},
        personality="Marketing & Growth Lead, warm + dry wit",
        speech_style="Delhi Hinglish, witty, modern",
        voice_id="hi-IN-SwaraNeural",
        voice_settings={"rate": 1.05, "pitch": 0.2, "volume": 1.0},
        wan_prompt_prefix="A highly realistic cinematic shot of Meera Kapoor, 23yo Delhi Indian female, warm witty stylish look",
        negative_prompt="blurry, animated, cartoon, old",
        scene_prompt_templates={"talking": "{prefix}, talking brightly about {action} in {location}", "walking": "{prefix}, walking in {location} while {action}", "reacting": "{prefix}, reacting to {action} at {location}", "sitting": "{prefix}, sitting in {location}, {action}"},
        canonical_face_path="public/characters/meera/master_face.jpg",
        reference_images=["public/characters/meera/crops/front.jpg", "public/characters/meera/crops/side.jpg"],
        asset_status="ASSETS_READY",
        identity_version="v1.0"
    ),
    "arjun": CharacterProfile(
        character_id="arjun",
        name="Arjun Mehta",
        age_range="28-32",
        gender="Male",
        appearance={"hair": "slicked back", "skin_tone": "medium brown", "wardrobe_profile": "finance bro, vest, crisp shirts", "body_type": "athletic"},
        personality="Finance bro, data-driven, surprisingly funny",
        speech_style="fast, analytical but humorous",
        voice_id="en-IN-PrabhatNeural",
        voice_settings={"rate": 1.1, "pitch": 0.0, "volume": 1.0},
        wan_prompt_prefix="A highly realistic cinematic shot of Arjun Mehta, 30yo Indian male, finance bro style with a vest",
        negative_prompt="blurry, animated, cartoon, messy",
        scene_prompt_templates={"talking": "{prefix}, explaining finance regarding {action} in {location}", "walking": "{prefix}, walking in {location} while {action}", "reacting": "{prefix}, reacting to {action} at {location}", "sitting": "{prefix}, sitting in {location}, {action}"},
        canonical_face_path=None,
        reference_images=[],
        asset_status="PENDING_REFERENCE_IMAGE",
        identity_version="v1.0"
    ),
    "zoya": CharacterProfile(
        character_id="zoya",
        name="Zoya Khan",
        age_range="24-28",
        gender="Female",
        appearance={"hair": "short bob", "skin_tone": "light brown", "wardrobe_profile": "design-obsessed, minimalist, chic", "body_type": "average"},
        personality="Product/UX, opinionated",
        speech_style="Lucknow accent, articulate",
        voice_id="hi-IN-SwaraNeural",
        voice_settings={"rate": 1.0, "pitch": 0.1, "volume": 1.0},
        wan_prompt_prefix="A highly realistic cinematic shot of Zoya Khan, 26yo Indian female, minimalist chic designer look",
        negative_prompt="blurry, animated, cartoon, messy",
        scene_prompt_templates={"talking": "{prefix}, discussing UX of {action} in {location}", "walking": "{prefix}, walking in {location} while {action}", "reacting": "{prefix}, reacting to {action} at {location}", "sitting": "{prefix}, sitting in {location}, {action}"},
        canonical_face_path=None,
        reference_images=[],
        asset_status="PENDING_REFERENCE_IMAGE",
        identity_version="v1.0"
    ),
    "kabir": CharacterProfile(
        character_id="kabir",
        name="Kabir Malhotra",
        age_range="27-32",
        gender="Male",
        appearance={"hair": "messy, slightly long", "skin_tone": "medium brown", "wardrobe_profile": "hoodie-wearing, dark colors", "body_type": "slim"},
        personality="Cybersecurity, serious but wry, slightly paranoid",
        speech_style="low voice, cautious",
        voice_id="hi-IN-MadhurNeural",
        voice_settings={"rate": 0.9, "pitch": -0.5, "volume": 1.0},
        wan_prompt_prefix="A highly realistic cinematic shot of Kabir Malhotra, 29yo Indian male, cybersecurity expert in a hoodie",
        negative_prompt="blurry, animated, cartoon, bright colors",
        scene_prompt_templates={"talking": "{prefix}, cautioning about {action} in {location}", "walking": "{prefix}, walking in {location} while {action}", "reacting": "{prefix}, reacting to {action} at {location}", "sitting": "{prefix}, sitting in {location}, {action}"},
        canonical_face_path=None,
        reference_images=[],
        asset_status="PENDING_REFERENCE_IMAGE",
        identity_version="v1.0"
    ),
    "dev": CharacterProfile(
        character_id="dev",
        name="Dev Bhatia",
        age_range="21-25",
        gender="Male",
        appearance={"hair": "trendy fade", "skin_tone": "fair", "wardrobe_profile": "Gen-Z streetwear", "body_type": "athletic"},
        personality="Tech Explainer, energetic, simplifies everything",
        speech_style="Gen-Z delivery, fast, enthusiastic",
        voice_id="en-IN-NeerjaNeural",
        voice_settings={"rate": 1.15, "pitch": 0.0, "volume": 1.0},
        wan_prompt_prefix="A highly realistic cinematic shot of Dev Bhatia, 23yo Indian male, energetic Gen-Z tech explainer streetwear",
        negative_prompt="blurry, animated, cartoon, formal",
        scene_prompt_templates={"talking": "{prefix}, enthusiastically explaining {action} in {location}", "walking": "{prefix}, walking in {location} while {action}", "reacting": "{prefix}, reacting to {action} at {location}", "sitting": "{prefix}, sitting in {location}, {action}"},
        canonical_face_path=None,
        reference_images=[],
        asset_status="PENDING_REFERENCE_IMAGE",
        identity_version="v1.0"
    )
}

def get_character(character_id: str) -> CharacterProfile:
    char = REGISTRY.get(character_id.lower())
    if not char:
        raise ValueError(f"Character {character_id} not found in registry.")
    return char

def get_available_characters() -> List[CharacterProfile]:
    return [char for char in REGISTRY.values() if char.asset_status == 'ASSETS_READY']

def get_wan_prompt(character_id: str, scene_type: str, action: str, location: str) -> str:
    char = get_character(character_id)
    template = char.scene_prompt_templates.get(scene_type)
    if not template:
        template = "{prefix}, {action} in {location}"
    
    return template.format(
        prefix=char.wan_prompt_prefix,
        action=action,
        location=location
    )

def export_registry_json(output_path: str):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    data = {char_id: asdict(char) for char_id, char in REGISTRY.items()}
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
    print(f"Exported registry to {output_path}")

def run_self_test():
    try:
        # Test get_character
        meera = get_character("meera")
        assert meera.name == "Meera Kapoor"
        assert meera.asset_status == "ASSETS_READY"
        
        # Test missing character
        try:
            get_character("unknown")
            assert False, "Should have raised ValueError"
        except ValueError:
            pass
            
        # Test available characters
        avail = get_available_characters()
        assert len(avail) == 1
        assert avail[0].character_id == "meera"
        
        # Test prompt generation
        prompt = get_wan_prompt("meera", "talking", "the new campaign", "a modern cafe")
        assert "Meera Kapoor" in prompt
        assert "modern cafe" in prompt
        
        # Test export
        out_path = os.path.join("public", "characters", "registry.json")
        export_registry_json(out_path)
        assert os.path.exists(out_path)
        
        print("SELF_TEST_PASSED")
    except Exception as e:
        print(f"SELF_TEST_FAILED: {e}")
        sys.exit(1)

def verify_all():
    print(f"{'ID':<10} | {'NAME':<20} | {'STATUS':<25} | {'FACE PATH'}")
    print("-" * 80)
    for char_id, char in REGISTRY.items():
        if char.asset_status == 'ASSETS_READY':
            path_exists = os.path.exists(char.canonical_face_path) if char.canonical_face_path else False
            status = "ASSETS_READY (FILE MISSING)" if not path_exists else "ASSETS_READY"
        else:
            status = char.asset_status
            
        print(f"{char_id:<10} | {char.name:<20} | {status:<25} | {char.canonical_face_path or 'N/A'}")

def list_characters():
    print(f"{'ID':<10} | {'NAME':<20} | {'STATUS'}")
    print("-" * 50)
    for char_id, char in REGISTRY.items():
        print(f"{char_id:<10} | {char.name:<20} | {char.asset_status}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CHATR Character Registry")
    parser.add_argument("--verify-all", action="store_true", help="Verify asset status")
    parser.add_argument("--list", action="store_true", help="List characters")
    parser.add_argument("--self-test", action="store_true", help="Run self tests")
    
    args = parser.parse_args()
    
    if args.self_test:
        run_self_test()
    elif args.verify_all:
        verify_all()
    elif args.list:
        list_characters()
    else:
        parser.print_help()
