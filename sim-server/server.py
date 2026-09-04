"""
CHATR Simulation Bridge Server — Gate 8.5
WebSocket JSON-RPC server on ws://localhost:7788
Bridges RobotOS (TypeScript) ↔ MuJoCo physics backend.

Protocol: JSON-RPC 2.0 over WebSocket
"""

import asyncio
import json
import logging
import os
import signal
import sys
import time
from pathlib import Path
from datetime import datetime, timezone

# Ensure sim-server dir is on path
sys.path.insert(0, str(Path(__file__).parent))
from mujoco_backend import MuJoCoBackend

HOST = "localhost"
PORT = 7788
SERVER_VERSION = "gate8.5.0"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("sim-bridge")


class SimBridgeServer:
    def __init__(self):
        self.backend = MuJoCoBackend(seed=42)
        self._connected_clients: set = set()
        self._run_counter = 0

    async def handle_client(self, websocket):
        client = websocket.remote_address
        self._connected_clients.add(websocket)
        log.info(f"Client connected: {client}")
        # Ensure fresh nominal standing pose on client connect
        self.backend.queue_command({"method": "reset", "params": {"seed": 42}})

        try:
            async for raw_msg in websocket:
                try:
                    msg = json.loads(raw_msg)
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({
                        "error": {"code": -32700, "message": "Parse error"}
                    }))
                    continue

                response = await self._dispatch(msg)
                await websocket.send(json.dumps(response))

        except Exception as e:
            log.warning(f"Client {client} disconnected: {e}")
        finally:
            self._connected_clients.discard(websocket)
            log.info(f"Client disconnected: {client}")

    async def _dispatch(self, msg: dict) -> dict:
        method = msg.get("method", "")
        params = msg.get("params", {})
        req_id = msg.get("id", None)

        try:
            if method == "ping":
                result = {
                    "pong": True,
                    "server_version": SERVER_VERSION,
                    "physics_version": self.backend.physics_version,
                    "profile_hash":    self.backend.profile_hash,
                    "timestamp_utc":   datetime.now(timezone.utc).isoformat(),
                }

            elif method == "get_state":
                result = self.backend.get_latest_state()

            elif method == "step":
                # Apply joint targets and return current state
                self.backend.queue_command({
                    "method": "set_joint_targets",
                    "params": params,
                })
                await asyncio.sleep(0.002)  # 500 Hz step
                result = self.backend.get_latest_state()

            elif method == "reset":
                self.backend.queue_command({"method": "reset", "params": params})
                await asyncio.sleep(0.1)  # Let physics settle
                result = self.backend.get_latest_state()

            elif method == "inject_fault":
                self.backend.queue_command({"method": "inject_fault", "params": params})
                result = {"acknowledged": True, "fault": params.get("type")}

            elif method == "get_server_info":
                result = {
                    "server_version":   SERVER_VERSION,
                    "physics_version":  self.backend.physics_version,
                    "profile_hash":     self.backend.profile_hash,
                    "env_hash":         self.backend.env_hash,
                    "physics_hz":       MuJoCoBackend.PHYSICS_HZ,
                    "joint_count":      len(self.backend.joint_names),
                    "joint_names":      self.backend.joint_names,
                    "provenance":       "MUJOCO_PHYSICS",
                    "is_mujoco_loaded": bool(self.backend.model is not None),
                }

            elif method == "teleop":
                self.backend.queue_command({"method": "teleop", "params": params})
                await asyncio.sleep(0.01)
                result = self.backend.get_latest_state()

            elif method == "dance":
                self.backend.queue_command({"method": "dance", "params": params})
                await asyncio.sleep(0.05)
                result = self.backend.get_latest_state()

            elif method in ("stand", "recover_balance"):
                self.backend.queue_command({"method": "stand", "params": params})
                await asyncio.sleep(0.05)
                result = self.backend.get_latest_state()

            elif method == "grasp_bottle":
                self.backend.queue_command({"method": "grasp_bottle", "params": params})
                await asyncio.sleep(0.05)
                result = self.backend.get_latest_state()

            elif method == "release_bottle":
                self.backend.queue_command({"method": "release_bottle", "params": params})
                await asyncio.sleep(0.05)
                result = self.backend.get_latest_state()

            elif method == "wave":
                self.backend.queue_command({"method": "wave", "params": params})
                await asyncio.sleep(0.05)
                result = self.backend.get_latest_state()

            elif method == "execute_task":
                self.backend.queue_command({"method": "execute_task", "params": params})
                await asyncio.sleep(0.05)
                result = self.backend.get_latest_state()

            elif method == "navigate":
                target = params.get("target", "kitchen")
                self.backend.queue_command({"method": "navigate", "params": params})
                await asyncio.sleep(0.05)
                result = self.backend.get_latest_state()
                result["navigation_command_acknowledged"] = True
                result["target"] = target

            else:
                return {
                    "id": req_id,
                    "error": {"code": -32601, "message": f"Method not found: {method}"},
                }

            return {"id": req_id, "result": result}

        except Exception as e:
            log.error(f"Error dispatching {method}: {e}", exc_info=True)
            return {
                "id": req_id,
                "error": {"code": -32603, "message": f"Internal error: {e}"},
            }

    async def broadcast_state(self):
        """Push state to all connected clients at ~50 Hz."""
        while True:
            if self._connected_clients:
                state = self.backend.get_latest_state()
                if state:
                    msg = json.dumps({"event": "state_update", "data": state})
                    dead = set()
                    for ws in list(self._connected_clients):
                        try:
                            await ws.send(msg)
                        except Exception:
                            dead.add(ws)
                    self._connected_clients -= dead
            await asyncio.sleep(0.02)  # 50 Hz broadcast

    async def run(self):
        # Load physics model
        log.info("Loading CHATR-H170 physics model...")
        ok = self.backend.load()
        if not ok:
            log.error("Failed to load physics model. Run: python sim-server/compiler/build_mjcf.py")
            sys.exit(1)

        # Start physics loop
        self.backend.start()
        log.info(f"Physics running at {MuJoCoBackend.PHYSICS_HZ} Hz")

        # Start WebSocket server
        try:
            import websockets
        except ImportError:
            log.error("websockets not installed. Run: python -m pip install websockets")
            sys.exit(1)

        log.info(f"Starting simulation bridge on ws://{HOST}:{PORT}")
        log.info(f"Provenance: MUJOCO_PHYSICS | Profile hash: {self.backend.profile_hash[:12]}...")

        async with websockets.serve(self.handle_client, HOST, PORT):
            log.info(f"✅ Simulation bridge ONLINE — ws://{HOST}:{PORT}")
            log.info(f"   RobotOS can now connect with: provenance = MUJOCO_PHYSICS")
            await asyncio.gather(
                asyncio.Future(),   # Run forever
                self.broadcast_state(),
            )


def main():
    server = SimBridgeServer()

    # Handle Ctrl-C
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    def shutdown(sig, frame):
        log.info("Shutting down simulation bridge...")
        server.backend.stop()
        loop.stop()

    signal.signal(signal.SIGINT,  shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    try:
        loop.run_until_complete(server.run())
    except KeyboardInterrupt:
        pass
    finally:
        server.backend.stop()
        loop.close()
        log.info("Simulation bridge stopped.")


if __name__ == "__main__":
    main()
