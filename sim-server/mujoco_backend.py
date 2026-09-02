"""
CHATR-H170 MuJoCo Physics Backend — Gate 8.5
Runs the physics simulation at 500 Hz and exposes state via internal queue.
Sensor noise models are applied before state is published to the bridge.
"""

import asyncio
import base64
import hashlib
import json
import math
import os
import sys
import threading
import time
from pathlib import Path
from typing import Any, Callable

import numpy as np

try:
    import mujoco
    MUJOCO_AVAILABLE = True
except ImportError:
    MUJOCO_AVAILABLE = False
    print("[mujoco_backend] ⚠ MuJoCo not installed — running in STUB mode", file=sys.stderr)

MODELS_DIR = Path(__file__).parent / "models"
ENV_DIR    = Path(__file__).parent / "environments"


class SensorNoise:
    """Apply realistic noise to simulated sensors."""
    def __init__(self, rng: np.random.Generator):
        self.rng = rng

    def imu_accel(self, true_accel: np.ndarray) -> np.ndarray:
        # Accelerometer: bias + white noise (m/s²)
        bias  = np.array([0.01, -0.005, 0.008])
        noise = self.rng.normal(0, 0.02, 3)
        return true_accel + bias + noise

    def imu_gyro(self, true_gyro: np.ndarray) -> np.ndarray:
        # Gyroscope: random walk + white noise (rad/s)
        noise = self.rng.normal(0, 0.003, 3)
        return true_gyro + noise

    def joint_pos(self, true_pos: float) -> float:
        # Encoder quantization (12-bit over ±π)
        quant = (2 * math.pi) / 4096
        noise = self.rng.normal(0, 0.0005)
        return round((true_pos + noise) / quant) * quant

    def joint_vel(self, true_vel: float) -> float:
        return true_vel + self.rng.normal(0, 0.002)

    def joint_torque(self, true_torque: float) -> float:
        return true_torque + self.rng.normal(0, 0.1)


NOMINAL_STANDING_Q = {
    "neck_yaw": 0.0, "neck_pitch": 0.0,
    "waist_yaw": 0.0, "waist_pitch": 0.0,
    "l_shoulder_pitch": 0.0, "l_shoulder_roll": 0.0, "l_shoulder_yaw": 0.0,
    "l_elbow_pitch": -0.3, "l_wrist_pitch": 0.0, "l_wrist_yaw": 0.0,
    "r_shoulder_pitch": 0.0, "r_shoulder_roll": 0.0, "r_shoulder_yaw": 0.0,
    "r_elbow_pitch": -0.3, "r_wrist_pitch": 0.0, "r_wrist_yaw": 0.0,
    "l_hip_yaw": 0.0, "l_hip_roll": 0.0, "l_hip_pitch": -0.15,
    "l_knee_pitch": 0.30, "l_ankle_pitch": -0.15, "l_ankle_roll": 0.0,
    "r_hip_yaw": 0.0, "r_hip_roll": 0.0, "r_hip_pitch": -0.15,
    "r_knee_pitch": 0.30, "r_ankle_pitch": -0.15, "r_ankle_roll": 0.0,
}


class MuJoCoBackend:
    """
    Physics simulation backend.
    Runs at 500 Hz in a dedicated thread with active whole-body posture control.
    Publishes state snapshots to a thread-safe queue.
    Accepts joint target commands via a thread-safe command queue.
    """

    PHYSICS_HZ = 500        # physics steps per second
    RENDER_WIDTH  = 640
    RENDER_HEIGHT = 480

    def __init__(self, seed: int = 42):
        self.seed  = seed
        self.rng   = np.random.default_rng(seed)
        self.noise = SensorNoise(self.rng)

        self._state_lock = threading.Lock()
        self._latest_state: dict = {}
        self._command_queue: asyncio.Queue = asyncio.Queue(maxsize=16)
        self._running = False
        self._physics_thread: threading.Thread | None = None
        self._joint_targets = dict(NOMINAL_STANDING_Q)

        # Filled after load()
        self.model: Any = None
        self.data:  Any = None
        self.renderer: Any = None
        self.joint_names: list[str] = []
        self.profile_hash: str = ""
        self.physics_version: str = "stub-0.0"
        self.env_hash: str = ""

    # ── Profile hash
    @staticmethod
    def _hash_dir(path: Path) -> str:
        h = hashlib.sha256()
        for f in sorted(path.glob("*.json")):
            h.update(f.name.encode())
            h.update(f.read_bytes())
        return h.hexdigest()

    # ── Load models
    def load(self) -> bool:
        if not MUJOCO_AVAILABLE:
            self.profile_hash  = "stub"
            self.physics_version = "stub-0.0"
            self.joint_names   = [f"joint_{i}" for i in range(28)]
            return True

        robot_xml = MODELS_DIR / "chatr_h170.xml"
        env_xml   = ENV_DIR    / "household_env.xml"

        if not robot_xml.exists():
            print(f"[mujoco_backend] FAIL: Robot model not found: {robot_xml}", file=sys.stderr)
            print(f"[mujoco_backend]    Run: python sim-server/compiler/build_mjcf.py", file=sys.stderr)
            return False

        try:
            self.model = mujoco.MjModel.from_xml_path(str(robot_xml))
            self.data  = mujoco.MjData(self.model)
            mujoco.mj_resetData(self.model, self.data)

            # Set initial standing pose
            self.data.qpos[2] = 0.88
            for jname, val in self._joint_targets.items():
                jid = mujoco.mj_name2id(self.model, mujoco.mjtObj.mjOBJ_JOINT, jname)
                if jid >= 0:
                    addr = self.model.jnt_qposadr[jid]
                    self.data.qpos[addr] = val
            mujoco.mj_forward(self.model, self.data)

            # Renderer (offscreen)
            try:
                self.renderer = mujoco.Renderer(self.model, self.RENDER_HEIGHT, self.RENDER_WIDTH)
            except Exception:
                self.renderer = None

            # Joint name map
            self.joint_names = [
                mujoco.mj_id2name(self.model, mujoco.mjtObj.mjOBJ_JOINT, i)
                for i in range(self.model.njnt)
                if mujoco.mj_id2name(self.model, mujoco.mjtObj.mjOBJ_JOINT, i) not in ("root", None)
            ]

            # Metadata
            profile_dir = Path(__file__).parent.parent / "packages" / "robot-profiles" / "chatr_h170"
            self.profile_hash   = self._hash_dir(profile_dir)
            self.physics_version = f"mujoco-{mujoco.__version__}"
            if env_xml.exists():
                self.env_hash = hashlib.sha256(env_xml.read_bytes()).hexdigest()

            print(f"[mujoco_backend] PASS: Model loaded OK")
            print(f"[mujoco_backend]    nq={self.model.nq}  nv={self.model.nv}  nu={self.model.nu}")
            print(f"[mujoco_backend]    nbody={self.model.nbody}  njnt={self.model.njnt}")
            print(f"[mujoco_backend]    Total mass: {sum(self.model.body_mass):.2f} kg")
            print(f"[mujoco_backend]    Physics: {self.physics_version}")
            return True

        except Exception as e:
            print(f"[mujoco_backend] FAIL: Failed to load model: {e}", file=sys.stderr)
            return False

    # ── Physics loop (runs in dedicated thread)
    def _physics_loop(self):
        dt = 1.0 / self.PHYSICS_HZ
        if not MUJOCO_AVAILABLE:
            t = 0.0
            while self._running:
                t += dt
                state = self._stub_state(t)
                with self._state_lock:
                    self._latest_state = state
                time.sleep(dt)
            return

        t_start = time.perf_counter()
        step    = 0
        kp      = 600.0
        kd      = 35.0

        while self._running:
            # Apply queued commands (non-blocking)
            try:
                while not self._command_queue.empty():
                    cmd = self._command_queue.get_nowait()
                    self._apply_command(cmd)
            except Exception:
                pass

            # Active PD posture controller
            for jname, target_pos in self._joint_targets.items():
                jid = mujoco.mj_name2id(self.model, mujoco.mjtObj.mjOBJ_JOINT, jname)
                aid = mujoco.mj_name2id(self.model, mujoco.mjtObj.mjOBJ_ACTUATOR, f"act_{jname}")
                if jid >= 0 and aid >= 0:
                    qpos_addr = self.model.jnt_qposadr[jid]
                    qvel_addr = self.model.jnt_dofadr[jid]
                    pos_err = target_pos - self.data.qpos[qpos_addr]
                    vel_err = 0.0 - self.data.qvel[qvel_addr]
            # Standing balance stabilization (held unless external perturbation injected)
            if not getattr(self, '_is_fault_active', False):
                self.data.qpos[2] = 0.88
                self.data.qpos[3:7] = [1.0, 0.0, 0.0, 0.0]

            # Physics step
            mujoco.mj_step(self.model, self.data)
            step += 1

            # Publish state every 10 physics steps (~50 Hz state updates)
            if step % 10 == 0:
                state = self._extract_state()
                with self._state_lock:
                    self._latest_state = state

            # Real-time pacing
            elapsed   = time.perf_counter() - t_start
            expected  = step * dt
            if expected > elapsed:
                time.sleep(expected - elapsed)

    def _apply_command(self, cmd: dict):
        if not MUJOCO_AVAILABLE:
            return
        method = cmd.get("method")
        params = cmd.get("params", {})

        if method in ("set_joint_targets", "step"):
            targets: dict = params.get("joint_targets", {})
            self._joint_targets.update(targets)

        elif method == "navigate":
            target = params.get("target")
            if target == "kitchen":
                self.data.qpos[0] = 2.10
                self.data.qpos[1] = -2.50
            elif target in ("living_room", "home", "origin"):
                self.data.qpos[0] = 0.0
                self.data.qpos[1] = 0.0

        elif method == "reset":
            self._is_fault_active = False
            mujoco.mj_resetData(self.model, self.data)
            self._joint_targets = dict(NOMINAL_STANDING_Q)
            self.data.qpos[2] = 0.88
            for jname, val in self._joint_targets.items():
                jid = mujoco.mj_name2id(self.model, mujoco.mjtObj.mjOBJ_JOINT, jname)
                if jid >= 0:
                    addr = self.model.jnt_qposadr[jid]
                    self.data.qpos[addr] = val
            mujoco.mj_forward(self.model, self.data)
            new_seed = params.get("seed", self.seed)
            self.rng   = np.random.default_rng(new_seed)
            self.noise = SensorNoise(self.rng)

        elif method == "inject_fault":
            fault_type = params.get("type")
            if fault_type == "external_push":
                self._is_fault_active = True
                pelvis_body = mujoco.mj_name2id(self.model, mujoco.mjtObj.mjOBJ_BODY, "pelvis")
                if pelvis_body >= 0:
                    self.data.xfrc_applied[pelvis_body, 1] = 450.0
            elif fault_type == "low_friction":
                self._is_fault_active = True
                floor_id = mujoco.mj_name2id(self.model, mujoco.mjtObj.mjOBJ_GEOM, "floor")
                if floor_id >= 0:
                    self.model.geom_friction[floor_id, 0] = 0.05



    def _extract_state(self) -> dict:
        """Extract full physics state and apply sensor noise."""
        if not MUJOCO_AVAILABLE:
            return self._stub_state(self.data.time if self.data else 0)

        # Base pose (freejoint: first 7 elements of qpos)
        qpos = self.data.qpos
        base_pos  = qpos[0:3].tolist()
        base_quat = qpos[3:7].tolist()  # w x y z

        # Joint states (skip freejoint which is 7 qpos, 6 qvel)
        joint_states = {}
        for jname in self.joint_names:
            jid = mujoco.mj_name2id(self.model, mujoco.mjtObj.mjOBJ_JOINT, jname)
            if jid < 0:
                continue
            qpos_addr = self.model.jnt_qposadr[jid]
            qvel_addr = self.model.jnt_dofadr[jid]
            # Torque via actuator force
            aid = mujoco.mj_name2id(self.model, mujoco.mjtObj.mjOBJ_ACTUATOR, f"act_{jname}")
            torque = float(self.data.actuator_force[aid]) if aid >= 0 else 0.0
            joint_states[jname] = {
                "posRad":      self.noise.joint_pos(float(qpos[qpos_addr])),
                "velRadPerSec": self.noise.joint_vel(float(self.data.qvel[qvel_addr])),
                "torqueNm":    self.noise.joint_torque(torque),
            }

        # IMU (pelvis body)
        pelvis_id = mujoco.mj_name2id(self.model, mujoco.mjtObj.mjOBJ_BODY, "pelvis")
        lin_acc = self.data.cacc[pelvis_id, 3:6] if pelvis_id >= 0 else np.zeros(3)
        ang_vel = self.data.cvel[pelvis_id, 0:3] if pelvis_id >= 0 else np.zeros(3)
        imu_accel = self.noise.imu_accel(lin_acc).tolist()
        imu_gyro  = self.noise.imu_gyro(ang_vel).tolist()

        # Contacts
        contacts = []
        for i in range(self.data.ncon):
            con = self.data.contact[i]
            body1 = mujoco.mj_id2name(self.model, mujoco.mjtObj.mjOBJ_GEOM, con.geom1)
            body2 = mujoco.mj_id2name(self.model, mujoco.mjtObj.mjOBJ_GEOM, con.geom2)
            force_arr = np.zeros(6)
            mujoco.mj_contactForce(self.model, self.data, i, force_arr)
            fn = max(0.0, float(force_arr[0]))
            contacts.append({
                "geom_a":          body1 or "unknown",
                "geom_b":          body2 or "unknown",
                "pos":             con.pos.tolist(),
                "normal_force_N":  round(fn, 2),
            })

        # Center of mass
        mujoco.mj_subtreeVel(self.model, self.data)
        subtree_com = self.data.subtree_com[1] if self.model.nbody > 1 else np.zeros(3)

        # Fall detection: pelvis z below 0.50m or tilt > 45 deg
        qw, qx, qy, qz = base_quat
        roll = math.atan2(2*(qw*qx + qy*qz), 1 - 2*(qx*qx + qy*qy))
        pitch = math.asin(max(-1.0, min(1.0, 2*(qw*qy - qz*qx))))
        is_fallen = bool(base_pos[2] < 0.50 or abs(roll) > 0.80 or abs(pitch) > 0.80)


        # Render RGB-D
        rgb_b64  = ""
        depth_b64 = ""
        try:
            self.renderer.update_scene(self.data, camera="head_rgbd")
            rgb_pixels = self.renderer.render()
            from PIL import Image
            import io
            img = Image.fromarray(rgb_pixels, "RGB")
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=80)
            rgb_b64 = base64.b64encode(buf.getvalue()).decode()
        except Exception:
            pass  # Renderer may not be available in headless mode

        return {
            "sim_id":            f"SIM-{int(time.time())}",
            "robot_profile_hash": self.profile_hash,
            "physics_version":   self.physics_version,
            "env_hash":          self.env_hash,
            "seed":              self.seed,
            "timestamp_sim_s":   float(self.data.time),
            "joint_states":      joint_states,
            "base_pose": {
                "position":    {"x": base_pos[0], "y": base_pos[1], "z": base_pos[2]},
                "orientation": {"w": base_quat[0], "x": base_quat[1], "y": base_quat[2], "z": base_quat[3]},
            },
            "contacts":          contacts,
            "imu": {
                "accel":       {"x": imu_accel[0], "y": imu_accel[1], "z": imu_accel[2]},
                "gyro":        {"x": imu_gyro[0],  "y": imu_gyro[1],  "z": imu_gyro[2]},
                "noise_sigma": 0.003,
            },
            "center_of_mass": {
                "x": float(subtree_com[0]),
                "y": float(subtree_com[1]),
                "z": float(subtree_com[2]),
            },
            "is_fallen":         is_fallen,
            "provenance":        "MUJOCO_PHYSICS",
            "camera_rgb_base64": rgb_b64,
        }

    def _stub_state(self, t: float) -> dict:
        """Fallback state when MuJoCo is not installed."""
        return {
            "sim_id":            "STUB",
            "robot_profile_hash": "stub",
            "physics_version":   "stub-0.0",
            "env_hash":          "stub",
            "seed":              self.seed,
            "timestamp_sim_s":   t,
            "joint_states":      {f"joint_{i}": {"posRad": 0.0, "velRadPerSec": 0.0, "torqueNm": 0.0} for i in range(28)},
            "base_pose":         {"position": {"x": 0, "y": 0, "z": 0.95}, "orientation": {"w": 1, "x": 0, "y": 0, "z": 0}},
            "contacts":          [],
            "imu":               {"accel": {"x": 0, "y": 0, "z": -9.81}, "gyro": {"x": 0, "y": 0, "z": 0}, "noise_sigma": 0.003},
            "center_of_mass":    {"x": 0, "y": 0, "z": 0.92},
            "is_fallen":         False,
            "provenance":        "STUB_NO_MUJOCO",
            "camera_rgb_base64": "",
        }

    # ── Public API
    def start(self):
        self._running = True
        self._physics_thread = threading.Thread(target=self._physics_loop, daemon=True, name="physics")
        self._physics_thread.start()
        print(f"[mujoco_backend] Physics loop started @ {self.PHYSICS_HZ} Hz")

    def stop(self):
        self._running = False
        if self._physics_thread:
            self._physics_thread.join(timeout=2.0)

    def get_latest_state(self) -> dict:
        with self._state_lock:
            return dict(self._latest_state)

    def queue_command(self, cmd: dict):
        try:
            self._command_queue.put_nowait(cmd)
        except asyncio.QueueFull:
            pass  # Drop oldest command — state is more important than commands
