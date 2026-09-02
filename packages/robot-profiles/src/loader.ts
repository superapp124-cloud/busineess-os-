/**
 * CHATR Robot Profile Loader
 */

import { RobotProfile } from './types';
import { ProfileValidator, ValidationResult } from './validator';

// Pre-bundled canonical CHATR-H170 JSON specs
import robotMeta from '../chatr_h170/robot.json';
import jointsDef from '../chatr_h170/joints.json';
import linksDef from '../chatr_h170/links.json';
import sensorsDef from '../chatr_h170/sensors.json';
import actuatorsDef from '../chatr_h170/actuators.json';
import batteryDef from '../chatr_h170/battery.json';
import controllersDef from '../chatr_h170/controllers.json';

export class ProfileLoader {
  private static cachedProfile: RobotProfile | null = null;

  /**
   * Loads and validates the canonical CHATR-H170 profile.
   */
  public static loadH170Profile(): { profile: RobotProfile; validation: ValidationResult } {
    if (this.cachedProfile) {
      const validation = ProfileValidator.validate(this.cachedProfile);
      return { profile: this.cachedProfile, validation };
    }

    const profile: RobotProfile = {
      robot: robotMeta as any,
      joints: jointsDef as any,
      links: linksDef as any,
      sensors: sensorsDef as any,
      actuators: actuatorsDef as any,
      battery: batteryDef as any,
      controllers: controllersDef as any,
    };

    const validation = ProfileValidator.validate(profile);
    if (!validation.valid) {
      const errors = validation.issues
        .filter((i) => i.severity === 'ERROR')
        .map((i) => `[${i.component}] ${i.message}`)
        .join('\n');
      throw new Error(`ProfileLoader: CHATR-H170 profile validation failed:\n${errors}`);
    }

    this.cachedProfile = profile;
    return { profile, validation };
  }
}
