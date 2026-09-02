/**
 * CHATR Physics Engine — Articulated Robot Dynamic Multibody Instance
 * Instantiates the 28-DOF CHATR-H170 robot directly from its validated profile.
 */

import { RigidBody, CollisionShape } from '../dynamics/rigidBody';
import { RevoluteJointConstraint } from './jointConstraint';
import { Vector3 } from '../math/vector3';
import { Quaternion } from '../math/quaternion';
import { RobotProfile } from '../../../robot-profiles/src/types';

export class ArticulatedRobot {
  public profile: RobotProfile;
  public links: Map<string, RigidBody> = new Map();
  public joints: Map<string, RevoluteJointConstraint> = new Map();
  public baseLink: RigidBody;

  constructor(profile: RobotProfile, spawnPosition = new Vector3(0, 0, 0.90)) {
    this.profile = profile;

    // 1. Instantiate all RigidBody links
    for (const linkDef of profile.links) {
      const isBase = linkDef.id === profile.robot.baseLink;
      const initialPos = isBase
        ? spawnPosition.clone()
        : spawnPosition.clone().add(new Vector3(linkDef.centerOfMassMeters.x, linkDef.centerOfMassMeters.y, linkDef.centerOfMassMeters.z));

      const collision: CollisionShape = {
        type: linkDef.collision.type as any,
        dimensions: {
          length: (linkDef.collision.dimensions as any)?.length,
          width: (linkDef.collision.dimensions as any)?.width,
          height: (linkDef.collision.dimensions as any)?.height,
          radius: (linkDef.collision.dimensions as any)?.radius,
        },
        offset: new Vector3(
          linkDef.collision.offset.x,
          linkDef.collision.offset.y,
          linkDef.collision.offset.z
        ),
      };

      const body = new RigidBody({
        id: linkDef.id,
        name: linkDef.name,
        massKg: linkDef.massKg,
        localInertia: linkDef.inertia,
        position: initialPos,
        orientation: new Quaternion(1, 0, 0, 0),
        isStatic: false,
        collision,
      });

      this.links.set(linkDef.id, body);
    }

    this.baseLink = this.links.get(profile.robot.baseLink)!;
    if (!this.baseLink) {
      throw new Error(`ArticulatedRobot: Base link '${profile.robot.baseLink}' not found.`);
    }

    // 2. Instantiate all RevoluteJoint constraints
    for (const jointDef of profile.joints) {
      const parent = this.links.get(jointDef.parentLink);
      const child = this.links.get(jointDef.childLink);

      if (!parent || !child) {
        throw new Error(`ArticulatedRobot: Missing link for joint ${jointDef.id}`);
      }

      const offset = jointDef.originOffsetMeters ?? { x: 0, y: 0, z: 0 };

      const constraint = new RevoluteJointConstraint({
        id: jointDef.id,
        name: jointDef.name,
        parentBody: parent,
        childBody: child,
        parentAnchor: new Vector3(offset.x, offset.y, offset.z),
        childAnchor: new Vector3(0, 0, 0),
        rotationAxis: new Vector3(
          jointDef.rotationAxis.x,
          jointDef.rotationAxis.y,
          jointDef.rotationAxis.z
        ),
        minAngleRad: jointDef.limits.minRad,
        maxAngleRad: jointDef.limits.maxRad,
        maxTorqueNm: jointDef.limits.maxTorqueNm,
      });

      this.joints.set(jointDef.id, constraint);
    }
  }

  /**
   * Returns total instantaneous mass across all 29 links
   */
  public getTotalMass(): number {
    let sum = 0;
    for (const link of this.links.values()) {
      sum += link.massKg;
    }
    return sum;
  }

  /**
   * Computes instantaneous world Center of Mass
   */
  public computeWorldCenterOfMass(): Vector3 {
    let totalM = 0;
    const weightedSum = new Vector3(0, 0, 0);

    for (const link of this.links.values()) {
      totalM += link.massKg;
      weightedSum.addScaled(link.position, link.massKg);
    }

    return weightedSum.scale(1.0 / totalM);
  }

  /**
   * Computes total kinetic energy across all 29 links
   */
  public getTotalKineticEnergy(): number {
    let totalKE = 0;
    for (const link of this.links.values()) {
      totalKE += link.getKineticEnergy();
    }
    return totalKE;
  }

  /**
   * Returns an array of all links for physics stepping
   */
  public getAllBodies(): RigidBody[] {
    return Array.from(this.links.values());
  }

  /**
   * Returns an array of all joint constraints
   */
  public getAllJoints(): RevoluteJointConstraint[] {
    return Array.from(this.joints.values());
  }
}
