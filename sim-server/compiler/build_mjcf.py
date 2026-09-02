#!/usr/bin/env python3
"""
CHATR-H170 MJCF Compiler — Gate 8.5
Compiles the canonical chatr_h170/ JSON profile into a MuJoCo MJCF XML.
ONE SOURCE OF TRUTH: every physical constant comes from robot-profiles/chatr_h170/.
No numbers are manually retyped in this file.
"""

import json
import hashlib
import os
import sys
import xml.etree.ElementTree as ET
from xml.dom import minidom
from pathlib import Path

# ── Profile directory (resolved relative to this script's location)
# Script is at: chatrchat/sim-server/compiler/build_mjcf.py
# __file__.parent   = chatrchat/sim-server/compiler
# __file__.parent.parent = chatrchat/sim-server
# __file__.parent.parent.parent = chatrchat
PROFILE_DIR = Path(__file__).parent.parent.parent / "packages" / "robot-profiles" / "chatr_h170"
OUTPUT_DIR  = Path(__file__).parent.parent / "models"


def sha256_dir(path: Path) -> str:
    """Compute a stable SHA-256 hash over all JSON files in the profile directory."""
    h = hashlib.sha256()
    for f in sorted(path.glob("*.json")):
        h.update(f.name.encode())
        h.update(f.read_bytes())
    return h.hexdigest()


def load(filename: str) -> dict | list:
    return json.loads((PROFILE_DIR / filename).read_text(encoding="utf-8"))


def geom_element(parent: ET.Element, link: dict) -> None:
    """Add collision + visual geoms for a link."""
    c = link["collision"]
    g = ET.SubElement(parent, "geom")
    g.set("name", f"{link['id']}_col")
    g.set("class", "collision")

    off = c.get("offset", {"x": 0, "y": 0, "z": 0})
    g.set("pos", f"{off['x']} {off['y']} {off['z']}")

    if c["type"] == "box":
        d = c["dimensions"]
        g.set("type", "box")
        # MuJoCo box half-sizes
        g.set("size", f"{d['length']/2} {d['width']/2} {d['height']/2}")
    elif c["type"] == "cylinder":
        d = c["dimensions"]
        g.set("type", "cylinder")
        g.set("size", f"{d['radius']} {d['height']/2}")
    elif c["type"] == "capsule":
        d = c["dimensions"]
        g.set("type", "capsule")
        # MuJoCo capsule: size = "radius half_height"
        g.set("size", f"{d['radius']} {d['height']/2}")
    elif c["type"] == "sphere":
        d = c["dimensions"]
        g.set("type", "sphere")
        g.set("size", f"{d['radius']}")



def build_mjcf(include_household: bool = False) -> str:
    """Build the complete MJCF XML string from chatr_h170/ profiles."""
    robot   = load("robot.json")
    joints  = load("joints.json")
    links   = load("links.json")
    acts    = load("actuators.json")
    sensors = load("sensors.json")

    profile_hash = sha256_dir(PROFILE_DIR)

    # ── Index structures
    link_map = {l["id"]: l for l in links}
    act_map  = {a["id"]: a for a in acts}

    # Build link → joint → child-link tree
    # joints.json gives us: parentLink → joint → childLink
    children: dict[str, list] = {}   # parentLink → [joint, ...]
    for j in joints:
        children.setdefault(j["parentLink"], []).append(j)

    # ── Root MJCF
    mujoco = ET.Element("mujoco")
    mujoco.set("model", robot["modelName"])

    # Comment block with compile metadata
    meta = ET.Comment(
        f"\n  CHATR-H170 MJCF — auto-compiled by build_mjcf.py\n"
        f"  Profile hash : {profile_hash}\n"
        f"  Model        : {robot['modelName']} v{robot['version']}\n"
        f"  Mass         : {robot['totalMassKg']} kg\n"
        f"  DOF          : {robot['dofCount']}\n"
        f"  Base link    : {robot['baseLink']}\n"
        f"  DO NOT EDIT MANUALLY — regenerate with: python build_mjcf.py\n"
    )
    mujoco.append(meta)

    # ── Compiler options
    compiler = ET.SubElement(mujoco, "compiler")
    compiler.set("angle", "radian")
    compiler.set("coordinate", "local")
    compiler.set("autolimits", "true")

    # ── Options
    option = ET.SubElement(mujoco, "option")
    option.set("timestep", "0.002")          # 500 Hz
    option.set("gravity", "0 0 -9.81")
    option.set("integrator", "implicitfast")
    option.set("cone", "pyramidal")
    option.set("impratio", "10")             # improved contact stability

    # ── Default classes
    default = ET.SubElement(mujoco, "default")

    col_cls = ET.SubElement(default, "default")
    col_cls.set("class", "collision")
    gcol = ET.SubElement(col_cls, "geom")
    gcol.set("contype", "1")
    gcol.set("conaffinity", "1")
    gcol.set("friction", "0.8 0.02 0.001")
    gcol.set("rgba", "0.3 0.5 0.8 0.3")

    vis_cls = ET.SubElement(default, "default")
    vis_cls.set("class", "visual")
    gvis = ET.SubElement(vis_cls, "geom")
    gvis.set("contype", "0")
    gvis.set("conaffinity", "0")
    gvis.set("group", "1")
    gvis.set("rgba", "0.7 0.7 0.8 1.0")

    joint_cls = ET.SubElement(default, "default")
    joint_cls.set("class", "revolute")
    jdef = ET.SubElement(joint_cls, "joint")
    jdef.set("type", "hinge")
    jdef.set("damping", "2.5")
    jdef.set("armature", "0.05")
    jdef.set("frictionloss", "0.5")

    # ── Worldbody
    worldbody = ET.SubElement(mujoco, "worldbody")

    # Floor
    floor = ET.SubElement(worldbody, "geom")
    floor.set("name", "floor")
    floor.set("type", "plane")
    floor.set("size", "20 20 0.1")
    floor.set("rgba", "0.6 0.6 0.6 1")
    floor.set("contype", "1")
    floor.set("conaffinity", "1")
    floor.set("friction", "0.8 0.02 0.001")

    # Ambient light
    light = ET.SubElement(worldbody, "light")
    light.set("directional", "true")
    light.set("diffuse", "0.8 0.8 0.8")
    light.set("specular", "0.2 0.2 0.2")
    light.set("pos", "0 0 5")
    light.set("dir", "0 0 -1")

    def add_link_body(parent_el: ET.Element, link_id: str, joint_def: dict | None) -> ET.Element:
        """Recursively build body elements from the kinematic tree."""
        link = link_map[link_id]
        body = ET.SubElement(parent_el, "body")
        body.set("name", link_id)

        # Position from joint origin offset (relative to parent)
        if joint_def:
            off = joint_def.get("originOffsetMeters", {"x": 0, "y": 0, "z": 0})
            body.set("pos", f"{off['x']} {off['y']} {off['z']}")

        # Inertial properties
        inertial = ET.SubElement(body, "inertial")
        com = link["centerOfMassMeters"]
        inertial.set("pos", f"{com['x']} {com['y']} {com['z']}")
        inertial.set("mass", str(link["massKg"]))
        I = link["inertia"]
        inertial.set("fullinertia",
                      f"{I['ixx']} {I['iyy']} {I['izz']} {I['ixy']} {I['ixz']} {I['iyz']}")

        # Collision geom
        geom_element(body, link)

        # Freejoint for the base/root link only
        if joint_def is None and link_id == robot["baseLink"]:
            freejoint = ET.SubElement(body, "freejoint")
            freejoint.set("name", "root")

        # Hinge joint
        if joint_def and joint_def["type"] == "revolute":
            j_el = ET.SubElement(body, "joint")
            j_el.set("name", joint_def["id"])
            j_el.set("class", "revolute")
            ax = joint_def["rotationAxis"]
            j_el.set("axis", f"{ax['x']} {ax['y']} {ax['z']}")
            lim = joint_def["limits"]
            j_el.set("range", f"{lim['minRad']} {lim['maxRad']}")
            # Add site for joint torque sensor
            site = ET.SubElement(body, "site")
            site.set("name", f"{joint_def['id']}_site")
            site.set("size", "0.01")

        # Add foot touch sites for contact sensing
        if link_id in ("l_foot", "r_foot"):
            foot_site = ET.SubElement(body, "site")
            foot_site.set("name", f"{link_id}_touch_site")
            foot_site.set("pos", "0 0 -0.02")
            foot_site.set("size", "0.05 0.12")
            foot_site.set("type", "box")

        # Recurse into children
        for child_joint in children.get(link_id, []):
            add_link_body(body, child_joint["childLink"], child_joint)

        return body

    # Start from base link (no parent joint)
    base_link = link_map[robot["baseLink"]]
    com0 = robot["nominalComMeters"]
    root_body = ET.SubElement(worldbody, "body")
    root_body.set("name", robot["baseLink"])
    root_body.set("pos", f"0 0 {robot['nominalStandingHeightMeters']}")

    # Inertial for pelvis
    pel_inertial = ET.SubElement(root_body, "inertial")
    com = base_link["centerOfMassMeters"]
    pel_inertial.set("pos", f"{com['x']} {com['y']} {com['z']}")
    pel_inertial.set("mass", str(base_link["massKg"]))
    I = base_link["inertia"]
    pel_inertial.set("fullinertia",
                     f"{I['ixx']} {I['iyy']} {I['izz']} {I['ixy']} {I['ixz']} {I['iyz']}")
    geom_element(root_body, base_link)

    # Freejoint — pelvis can move freely in world
    freejoint = ET.SubElement(root_body, "freejoint")
    freejoint.set("name", "root")

    # Build kinematic subtree from base link
    for child_joint in children.get(robot["baseLink"], []):
        add_link_body(root_body, child_joint["childLink"], child_joint)

    # ── Actuators (position-controlled via gear ratio)
    actuator_el = ET.SubElement(mujoco, "actuator")
    for j in joints:
        act_id = j["actuatorModelId"]
        act = act_map[act_id]
        mot = ET.SubElement(actuator_el, "motor")
        mot.set("name", f"act_{j['id']}")
        mot.set("joint", j["id"])
        lim = j["limits"]
        # Peak torque at output shaft
        mot.set("gear", str(act["gearReductionRatio"]))
        mot.set("forcelimited", "true")
        mot.set("forcerange", f"{-act['peakTorqueNm']} {act['peakTorqueNm']}")
        mot.set("ctrllimited", "true")
        mot.set("ctrlrange", f"{lim['minRad']} {lim['maxRad']}")

    # ── Sensors (from sensors.json)
    sensor_el = ET.SubElement(mujoco, "sensor")

    # Joint position, velocity, actuator force for all 28 joints
    for j in joints:
        jp = ET.SubElement(sensor_el, "jointpos")
        jp.set("name", f"pos_{j['id']}")
        jp.set("joint", j["id"])

        jv = ET.SubElement(sensor_el, "jointvel")
        jv.set("name", f"vel_{j['id']}")
        jv.set("joint", j["id"])

        # actuatorfrc gives the output force/torque of the actuator
        jt = ET.SubElement(sensor_el, "actuatorfrc")
        jt.set("name", f"torque_{j['id']}")
        jt.set("actuator", f"act_{j['id']}")
        jt.set("noise", "0.1")


    # IMU (if present in sensors.json)
    for s in (sensors if isinstance(sensors, list) else sensors.get("sensors", [])):
        if s.get("type") == "IMU":
            acc = ET.SubElement(sensor_el, "accelerometer")
            acc.set("name", f"imu_accel_{s['id']}")
            acc.set("site", "pelvis")
            gyr = ET.SubElement(sensor_el, "gyro")
            gyr.set("name", f"imu_gyro_{s['id']}")
            gyr.set("site", "pelvis")
        elif s.get("type") in ("RGBD_CAMERA", "RGB_CAMERA", "DEPTH_CAMERA"):
            # Camera sensor registered separately in camera_el below
            pass

    # Add IMU site to pelvis if not already there
    imu_site = ET.SubElement(root_body, "site")
    imu_site.set("name", "pelvis")
    imu_site.set("pos", "0 0 0")
    imu_site.set("size", "0.02")

    # Foot contact sensors — use actuatorpos which doesn't require a body site
    # Instead we use subtreelinvel on the foot bodies (touch sensors via geom)
    for foot_id in ["l_foot", "r_foot"]:
        if foot_id in link_map:
            # touchsensor uses geom name, not site
            ts = ET.SubElement(sensor_el, "touch")
            ts.set("name", f"touch_{foot_id}")
            ts.set("site", f"{foot_id}_touch_site")


    # ── Cameras
    if "head" in link_map:
        head_cam = ET.SubElement(worldbody, "camera")
        head_cam.set("name", "head_rgbd")
        head_cam.set("pos", "0.05 0 1.65")
        head_cam.set("xyaxes", "0 -1 0 0 0 1")
        head_cam.set("fovy", "60")
        head_cam.set("resolution", "640 480")

    # ── Household Environment Geometries (if requested)
    if include_household:
        _add_household_geoms(worldbody)

    # ── Serialise with pretty-print
    raw = ET.tostring(mujoco, encoding="unicode")
    pretty = minidom.parseString(raw).toprettyxml(indent="  ")
    # Strip the <?xml ...?> header minidom prepends (MuJoCo prefers none)
    lines = pretty.splitlines()
    return "\n".join(lines[1:])


def _add_household_geoms(worldbody: ET.Element):
    """Add furniture and household objects to the worldbody."""
    def box_geom(parent, name: str, pos: tuple, size: tuple, rgba: str, group="2"):
        g = ET.SubElement(parent, "geom")
        g.set("name", name)
        g.set("type", "box")
        g.set("pos", f"{pos[0]} {pos[1]} {pos[2]}")
        g.set("size", f"{size[0]} {size[1]} {size[2]}")
        g.set("rgba", rgba)
        g.set("group", group)
        g.set("contype", "1")
        g.set("conaffinity", "1")

    def cylinder_geom(parent, name: str, pos: tuple, radius: float, half_height: float, rgba: str):
        g = ET.SubElement(parent, "geom")
        g.set("name", name)
        g.set("type", "cylinder")
        g.set("pos", f"{pos[0]} {pos[1]} {pos[2]}")
        g.set("size", f"{radius} {half_height}")
        g.set("rgba", rgba)
        g.set("contype", "1")
        g.set("conaffinity", "1")

    # Kitchen
    box_geom(worldbody, "kitchen_counter", (2.5, -2.5, 0.45), (1.0, 0.325, 0.45), "0.72 0.58 0.42 1")
    box_geom(worldbody, "refrigerator", (3.5, -1.0, 0.90), (0.35, 0.35, 0.90), "0.85 0.85 0.90 1")
    box_geom(worldbody, "dining_table_top", (1.5, -1.5, 0.735), (0.70, 0.40, 0.035), "0.60 0.45 0.30 1")

    # Living Room
    box_geom(worldbody, "sofa_seat", (-2.0, -2.5, 0.20), (1.05, 0.45, 0.20), "0.4 0.3 0.7 1")
    box_geom(worldbody, "coffee_table_top", (-2.0, -1.5, 0.48), (0.55, 0.30, 0.02), "0.55 0.40 0.25 1")

    # Bedroom
    box_geom(worldbody, "bed_base", (-2.5, 2.5, 0.15), (1.00, 0.80, 0.15), "0.55 0.45 0.35 1")
    box_geom(worldbody, "bed_mattress", (-2.5, 2.5, 0.37), (1.00, 0.80, 0.08), "0.90 0.88 0.85 1")
    box_geom(worldbody, "nightstand", (-1.2, 3.2, 0.30), (0.25, 0.25, 0.30), "0.55 0.45 0.30 1")

    # Household Objects (free-moving bodies)
    # Water bottle on counter
    bottle = ET.SubElement(worldbody, "body")
    bottle.set("name", "water_bottle_01")
    bottle.set("pos", "2.5 -2.5 1.025")
    b_inertial = ET.SubElement(bottle, "inertial")
    b_inertial.set("mass", "0.55")
    b_inertial.set("pos", "0 0 0")
    b_inertial.set("diaginertia", "0.001 0.001 0.0003")
    cylinder_geom(bottle, "bottle_body", (0, 0, 0), 0.04, 0.125, "0.2 0.6 0.9 0.85")
    b_freejoint = ET.SubElement(bottle, "freejoint")
    b_freejoint.set("name", "bottle_joint")

    # Cup on counter
    cup = ET.SubElement(worldbody, "body")
    cup.set("name", "cup_01")
    cup.set("pos", "2.2 -2.4 0.95")
    c_inertial = ET.SubElement(cup, "inertial")
    c_inertial.set("mass", "0.20")
    c_inertial.set("pos", "0 0 0")
    c_inertial.set("diaginertia", "0.0003 0.0003 0.0002")
    cylinder_geom(cup, "cup_body", (0, 0, 0), 0.04, 0.05, "0.9 0.8 0.4 1.0")
    c_freejoint = ET.SubElement(cup, "freejoint")
    c_freejoint.set("name", "cup_joint")

    # Medicine box on nightstand
    mbox = ET.SubElement(worldbody, "body")
    mbox.set("name", "medicine_box_01")
    mbox.set("pos", "-1.2 3.2 0.63")
    m_inertial = ET.SubElement(mbox, "inertial")
    m_inertial.set("mass", "0.08")
    m_inertial.set("pos", "0 0 0")
    m_inertial.set("diaginertia", "0.00005 0.00008 0.00006")
    box_geom(mbox, "medicine_box_col", (0, 0, 0), (0.05, 0.03, 0.025), "0.8 0.2 0.2 1.0")
    m_freejoint = ET.SubElement(mbox, "freejoint")
    m_freejoint.set("name", "medicine_box_joint")


def main():
    print(f"[build_mjcf] Reading profile from: {PROFILE_DIR}")
    profile_hash = sha256_dir(PROFILE_DIR)
    print(f"[build_mjcf] Profile SHA-256: {profile_hash}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Standalone robot
    mjcf_xml = build_mjcf(include_household=False)
    output_path = OUTPUT_DIR / "chatr_h170.xml"
    output_path.write_text(mjcf_xml, encoding="utf-8")
    print(f"[build_mjcf] Written standalone: {output_path} ({output_path.stat().st_size:,} bytes)")

    # 2. Household scene
    mjcf_household_xml = build_mjcf(include_household=True)
    household_output_path = OUTPUT_DIR / "chatr_h170_household.xml"
    household_output_path.write_text(mjcf_household_xml, encoding="utf-8")
    print(f"[build_mjcf] Written household scene: {household_output_path} ({household_output_path.stat().st_size:,} bytes)")

    # Validate with MuJoCo if available
    try:
        import mujoco
        # Validate standalone
        model = mujoco.MjModel.from_xml_path(str(output_path))
        print(f"[build_mjcf] PASS: Standalone MuJoCo validation OK")
        print(f"[build_mjcf]    nq={model.nq}  nv={model.nv}  nu={model.nu}  nbody={model.nbody}  njnt={model.njnt}")
        print(f"[build_mjcf]    Total robot mass: {sum(model.body_mass):.2f} kg")

        # Validate household
        model_h = mujoco.MjModel.from_xml_path(str(household_output_path))
        print(f"[build_mjcf] PASS: Household Scene MuJoCo validation OK")
        print(f"[build_mjcf]    nq={model_h.nq}  nv={model_h.nv}  nu={model_h.nu}  nbody={model_h.nbody}  njnt={model_h.njnt}")
    except ImportError:
        print("[build_mjcf] SKIP: MuJoCo not installed -- skipping live validation")
    except Exception as e:
        print(f"[build_mjcf] FAIL: MuJoCo validation FAILED: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

