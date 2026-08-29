"""
CHATR Media Agency — Local Free Video & Audio Generation Pipeline
Powered by Python 3.14 + edge-tts (₹0 Cost Studio Vocals & Lip-Sync Bridge)
"""

import asyncio
import json
import os
import sys
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import edge_tts

# Ensure UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

PORT = 5055
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "videos"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICES = {
    "hindi_female_reporter": "hi-IN-SwaraNeural",
    "urdu_female_sufi": "ur-IN-GulNeural",
    "hindi_male_narrator": "hi-IN-MadhurNeural",
    "english_female_journalist": "en-IN-NeerjaNeural",
    "english_male_presenter": "en-IN-PrabhatNeural"
}

async def generate_speech_async(text: str, voice_key: str, output_filename: str):
    voice_name = VOICES.get(voice_key, "hi-IN-SwaraNeural")
    target_path = os.path.join(OUTPUT_DIR, output_filename)

    try:
        communicate = edge_tts.Communicate(text, voice_name)
        await communicate.save(target_path)
    except Exception as e:
        # Fallback to SwaraNeural if specific script/voice fails
        print(f"[WARN] Voice {voice_name} failed: {e}. Falling back to hi-IN-SwaraNeural...")
        communicate = edge_tts.Communicate(text, "hi-IN-SwaraNeural")
        await communicate.save(target_path)

    return f"/videos/{output_filename}"

class PipelineHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/status":
            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            status_data = {
                "status": "online",
                "engine": "Python Edge-TTS + Local Video Pipeline",
                "cost": "₹0.00 (Free Local Compute)",
                "voices": VOICES
            }
            self.wfile.write(json.dumps(status_data).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/api/tts":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(body)

            text = data.get("text", "गुरुग्राम में भारी बारिश के बाद सड़कों पर जलभराव हो गया है।")
            voice = data.get("voice", "hindi_female_reporter")
            filename = f"voice_{int(time.time() * 1000)}.mp3"

            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                audio_url = loop.run_until_complete(generate_speech_async(text, voice, filename))
                loop.close()

                self.send_response(200)
                self._set_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "audioUrl": audio_url,
                    "filename": filename,
                    "voice": voice
                }).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self._set_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))

def run_server():
    server_address = ("127.0.0.1", PORT)
    httpd = HTTPServer(server_address, PipelineHandler)
    print(f"[CHATR Pipeline] Local Media Engine running on http://127.0.0.1:{PORT}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
