"""
CHATR-H170 Household Environment Builder — Gate 8.5
Generates household_env.xml: kitchen / living room / bedroom / corridor + household objects.
All geometry constants are in this file and represent the real-world dimensions from CHATR's
SemanticHomeMap (packages/robot-perception/src/mapping/semanticMap.ts).
"""

import xml.etree.ElementTree as ET
from xml.dom import minidom
from pathlib import Path


def build_household_env() -> str:
    mujoco = ET.Element("mujoco")
    mujoco.set("model", "household_env_01")

    # ── Floor
    worldbody = ET.SubElement(mujoco, "worldbody")

    # ── Room: Kitchen (X: 0..4, Y: -4..0)
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

    # ─── Kitchen ───
    # Kitchen counter: pos [2.5, -2.5, 0.45], dims [2.0, 0.65, 0.90]
    box_geom(worldbody, "kitchen_counter", (2.5, -2.5, 0.45), (1.0, 0.325, 0.45), "0.72 0.58 0.42 1")

    # Refrigerator: pos [3.5, -1.0, 0.90], dims [0.70, 0.70, 1.80]
    box_geom(worldbody, "refrigerator", (3.5, -1.0, 0.90), (0.35, 0.35, 0.90), "0.85 0.85 0.90 1")

    # Dining table: pos [1.5, -1.5, 0.38], dims [1.40, 0.80, 0.75]
    box_geom(worldbody, "dining_table_top", (1.5, -1.5, 0.735), (0.70, 0.40, 0.035), "0.60 0.45 0.30 1")
    box_geom(worldbody, "dining_table_leg1", (1.1, -1.1, 0.35), (0.025, 0.025, 0.35), "0.50 0.35 0.20 1")
    box_geom(worldbody, "dining_table_leg2", (1.9, -1.1, 0.35), (0.025, 0.025, 0.35), "0.50 0.35 0.20 1")
    box_geom(worldbody, "dining_table_leg3", (1.1, -1.9, 0.35), (0.025, 0.025, 0.35), "0.50 0.35 0.20 1")
    box_geom(worldbody, "dining_table_leg4", (1.9, -1.9, 0.35), (0.025, 0.025, 0.35), "0.50 0.35 0.20 1")

    # ─── Living Room (X: -4..0, Y: -4..0) ───
    # Sofa: pos [-2.0, -2.5, 0.40], dims [2.10, 0.90, 0.80]
    box_geom(worldbody, "sofa_seat",  (-2.0, -2.5, 0.20), (1.05, 0.45, 0.20), "0.4 0.3 0.7 1")
    box_geom(worldbody, "sofa_back",  (-2.0, -3.0, 0.50), (1.05, 0.08, 0.50), "0.4 0.3 0.7 1")

    # Coffee table: pos [-2.0, -1.5, 0.25], dims [1.10, 0.60, 0.50]
    box_geom(worldbody, "coffee_table_top", (-2.0, -1.5, 0.48), (0.55, 0.30, 0.02), "0.55 0.40 0.25 1")

    # ─── Bedroom (X: -4..0, Y: 0..4) ───
    # Bed: pos [-2.5, 2.5, 0.35], dims [2.00, 1.60, 0.70]
    box_geom(worldbody, "bed_base", (-2.5, 2.5, 0.15), (1.00, 0.80, 0.15), "0.55 0.45 0.35 1")
    box_geom(worldbody, "bed_mattress", (-2.5, 2.5, 0.37), (1.00, 0.80, 0.08), "0.90 0.88 0.85 1")
    box_geom(worldbody, "bed_headboard", (-2.5, 3.35, 0.60), (1.00, 0.05, 0.45), "0.50 0.40 0.30 1")

    # Nightstand: pos [-1.2, 3.2, 0.38]
    box_geom(worldbody, "nightstand", (-1.2, 3.2, 0.30), (0.25, 0.25, 0.30), "0.55 0.45 0.30 1")

    # ─── Corridor walls (simplified) ───
    # Wall between kitchen and living room
    box_geom(worldbody, "wall_kitchen_living", (0.0, -2.0, 1.2), (0.05, 2.0, 1.2), "0.85 0.85 0.80 0.5", group="3")
    # Wall between living room and bedroom
    box_geom(worldbody, "wall_living_bedroom", (-2.0, 0.0, 1.2), (2.0, 0.05, 1.2), "0.85 0.85 0.80 0.5", group="3")

    # ─── Household Objects (free-moving, must be grasped by physics) ───

    # Water bottle — on kitchen counter, centre [2.5, -2.5, 1.025]
    bottle = ET.SubElement(worldbody, "body")
    bottle.set("name", "water_bottle_01")
    bottle.set("pos", "2.5 -2.5 1.125")
    b_inertial = ET.SubElement(bottle, "inertial")
    b_inertial.set("mass", "0.55")
    b_inertial.set("pos", "0 0 0")
    b_inertial.set("diaginertia", "0.001 0.001 0.0003")
    cylinder_geom(bottle, "bottle_body", (0, 0, 0), 0.04, 0.125, "0.2 0.6 0.9 0.85")
    b_freejoint = ET.SubElement(bottle, "freejoint")
    b_freejoint.set("name", "bottle_joint")
    b_site = ET.SubElement(bottle, "site")
    b_site.set("name", "bottle_contact_site")
    b_site.set("size", "0.01")

    # Cup — on kitchen counter [2.2, -2.4, 0.95]
    cup = ET.SubElement(worldbody, "body")
    cup.set("name", "cup_01")
    cup.set("pos", "2.2 -2.4 0.975")
    c_inertial = ET.SubElement(cup, "inertial")
    c_inertial.set("mass", "0.20")
    c_inertial.set("pos", "0 0 0")
    c_inertial.set("diaginertia", "0.0003 0.0003 0.0002")
    cylinder_geom(cup, "cup_body", (0, 0, 0), 0.04, 0.05, "0.9 0.8 0.4 1.0")
    c_freejoint = ET.SubElement(cup, "freejoint")
    c_freejoint.set("name", "cup_joint")

    # Medicine box — on nightstand [-1.2, 3.2, 0.76]
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

    # Clothes (simplified as flat box) — on bedroom floor [-1.8, 1.8, 0.03]
    cloth = ET.SubElement(worldbody, "body")
    cloth.set("name", "clothes_01")
    cloth.set("pos", "-1.8 1.8 0.04")
    cl_inertial = ET.SubElement(cloth, "inertial")
    cl_inertial.set("mass", "0.35")
    cl_inertial.set("pos", "0 0 0")
    cl_inertial.set("diaginertia", "0.002 0.003 0.004")
    box_geom(cloth, "clothes_col", (0, 0, 0), (0.20, 0.15, 0.025), "0.3 0.5 0.8 0.8")
    cl_freejoint = ET.SubElement(cloth, "freejoint")
    cl_freejoint.set("name", "clothes_joint")

    # ── Human placeholder (passive — no actuators)
    human = ET.SubElement(worldbody, "body")
    human.set("name", "human_01")
    human.set("pos", "-1.5 -1.5 0.88")
    h_inertial = ET.SubElement(human, "inertial")
    h_inertial.set("mass", "70.0")
    h_inertial.set("pos", "0 0 0")
    h_inertial.set("diaginertia", "5.0 4.0 1.5")
    box_geom(human, "human_body", (0, 0, 0), (0.20, 0.15, 0.88), "0.9 0.7 0.5 0.6")
    h_freejoint = ET.SubElement(human, "freejoint")
    h_freejoint.set("name", "human_joint")

    # ── Charging dock (passive geom)
    box_geom(worldbody, "charging_dock", (0.0, 0.0, 0.05), (0.15, 0.10, 0.05), "0.2 0.8 0.2 1.0")

    # ── Serialise
    raw = ET.tostring(mujoco, encoding="unicode")
    pretty = minidom.parseString(raw).toprettyxml(indent="  ")
    lines = pretty.splitlines()
    return "\n".join(lines[1:])


if __name__ == "__main__":
    output = Path(__file__).parent.parent / "environments" / "household_env.xml"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(build_household_env(), encoding="utf-8")
    print(f"[build_env] Written: {output}")
