import argparse
import json
import os

CATEGORY_MUSIC_MAP = {
    'entertainment': 'upbeat_pop',
    'humour': 'playful_quirky',
    'politics': 'neutral_ambient',
    'sports': 'energetic_hiphop',
    'technology': 'electronic_minimal',
    'human_story': 'emotional_acoustic',
    'music_culture': 'trending_bollywood',
    'india': 'desi_fusion',
    'viral_trend': 'upbeat_pop',
    'current_affairs': 'neutral_ambient',
    'default': 'neutral_ambient'
}

LOCAL_TRACK_MANIFEST = [
    {
        'track_id': 'trk_001',
        'title': 'Monsoon Pop',
        'artist': 'CHATR Audio',
        'genre': 'upbeat_pop',
        'bpm': 120,
        'duration_sec': 180,
        'license': 'CC0',
        'file_path': 'public/audio/library/02_monsoon_pop.wav'
    },
    {
        'track_id': 'trk_002',
        'title': 'LoFi Chill',
        'artist': 'CHATR Audio',
        'genre': 'playful_quirky',
        'bpm': 85,
        'duration_sec': 210,
        'license': 'CC0',
        'file_path': 'public/audio/real/lofi_chill.m4a'
    },
    {
        'track_id': 'trk_003',
        'title': 'Acoustic Unplugged',
        'artist': 'CHATR Audio',
        'genre': 'neutral_ambient',
        'bpm': 95,
        'duration_sec': 150,
        'license': 'CC0',
        'file_path': 'public/audio/library/13_acoustic_unplugged.wav'
    },
    {
        'track_id': 'trk_004',
        'title': 'Desi Hiphop',
        'artist': 'CHATR Audio',
        'genre': 'energetic_hiphop',
        'bpm': 140,
        'duration_sec': 190,
        'license': 'CC0',
        'file_path': 'public/audio/library/09_desi_hiphop.wav'
    },
    {
        'track_id': 'trk_005',
        'title': 'Trap EDM',
        'artist': 'CHATR Audio',
        'genre': 'electronic_minimal',
        'bpm': 128,
        'duration_sec': 200,
        'license': 'CC0',
        'file_path': 'public/audio/library/11_trap_edm.wav'
    },
    {
        'track_id': 'trk_006',
        'title': 'Bollywood 90s',
        'artist': 'CHATR Audio',
        'genre': 'trending_bollywood',
        'bpm': 110,
        'duration_sec': 240,
        'license': 'CC0',
        'file_path': 'public/audio/library/03_bollywood_90s.wav'
    },
    {
        'track_id': 'trk_007',
        'title': 'Coke Studio Fusion',
        'artist': 'CHATR Audio',
        'genre': 'desi_fusion',
        'bpm': 100,
        'duration_sec': 160,
        'license': 'CC0',
        'file_path': 'public/audio/library/12_coke_studio_fusion.wav'
    },
    {
        'track_id': 'trk_008',
        'title': 'Emotional Acoustic',
        'artist': 'CHATR Audio',
        'genre': 'emotional_acoustic',
        'bpm': 90,
        'duration_sec': 140,
        'license': 'CC0',
        'file_path': 'public/audio/library/13_acoustic_unplugged.wav'
    }
]

def select_music(category: str, duration_sec: float) -> dict:
    genre = CATEGORY_MUSIC_MAP.get(category, CATEGORY_MUSIC_MAP['default'])
    
    # Filter available tracks by genre
    tracks = [t for t in LOCAL_TRACK_MANIFEST if t['genre'] == genre]
    
    if not tracks:
        # Fallback to remote / generic
        return {
            'track_id': 'trk_remote',
            'title': f'Remote Track ({genre})',
            'artist': 'Pixabay',
            'genre': genre,
            'bpm': 100,
            'duration_sec': duration_sec,
            'license': 'CC0',
            'file_path': 'REMOTE',
            'pixabay_url': f'https://pixabay.com/music/search/genre={genre}/'
        }
        
    # Return first matching track
    track = tracks[0].copy()
    
    # Verify file actually exists
    if not os.path.exists(os.path.join('c:\\Users\\Arshid.Wani\\chatrchat', track['file_path'])):
        track['file_path'] = 'REMOTE'
        track['pixabay_url'] = f"https://pixabay.com/music/search/genre={genre}/"
        
    return track

def get_ffmpeg_mix_command(track_path: str, voice_path: str, output_path: str, voice_vol: float = 1.0, music_vol: float = 0.12) -> list:
    return [
        'ffmpeg',
        '-y',
        '-i', voice_path,
        '-i', track_path,
        '-filter_complex',
        f'[0:a]volume={voice_vol}[v];[1:a]volume={music_vol}[m];[v][m]amix=inputs=2:duration=first:dropout_transition=2[aout]',
        '-map', '[aout]',
        output_path
    ]

def run_selftest():
    categories = ['entertainment', 'humour', 'sports', 'unknown']
    for cat in categories:
        print(f"--- Selecting music for '{cat}' ---")
        track = select_music(cat, 60.0)
        print(json.dumps(track, indent=2))
        
        # Test ffmpeg command gen
        cmd = get_ffmpeg_mix_command(
            track_path=track['file_path'],
            voice_path='public/audio/voice.wav',
            output_path='public/audio/mixed.wav'
        )
        print("FFmpeg cmd:", " ".join(cmd))
        print()

def list_tracks():
    print(json.dumps(LOCAL_TRACK_MANIFEST, indent=2))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CHATR Music Selector")
    parser.add_argument('--category', type=str, help="Content category")
    parser.add_argument('--duration', type=float, default=60.0, help="Duration in seconds")
    parser.add_argument('--list', action='store_true', help="List available tracks")
    parser.add_argument('--self-test', action='store_true', help="Run self tests")
    
    args = parser.parse_args()
    
    if args.self_test:
        run_selftest()
    elif args.list:
        list_tracks()
    elif args.category:
        print(json.dumps(select_music(args.category, args.duration), indent=2))
    else:
        parser.print_help()
