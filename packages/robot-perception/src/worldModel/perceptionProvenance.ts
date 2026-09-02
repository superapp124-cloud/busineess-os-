/**
 * CHATR Perception Provenance & Reproducibility Manifest (Gate 5)
 */

export interface PerceptionProvenanceManifest {
  manifestId: string;
  gate: 'GATE-5';
  timestamp: string;
  sensorConfigHash: string;
  sceneHash: string;
  noiseSeed: number;
  worldModelVersion: number;
  cameraIntrinsics: {
    resolution: string;
    hfovDegrees: number;
    depthRange: string;
  };
  detectorArtifact: string;
}

export class PerceptionProvenance {
  public static generateManifest(
    noiseSeed: number,
    worldModelVersion: number,
    sceneName = 'CANONICAL_HOME_01'
  ): PerceptionProvenanceManifest {
    return {
      manifestId: `PERCEPT-MANIFEST-${Date.now().toString(16)}`,
      gate: 'GATE-5',
      timestamp: new Date().toISOString(),
      sensorConfigHash: 'INTEL-REALSENSE-D435-SYNTH-V1',
      sceneHash: `SCENE-${sceneName}-REV-1`,
      noiseSeed,
      worldModelVersion,
      cameraIntrinsics: {
        resolution: '640x480',
        hfovDegrees: 55.0,
        depthRange: '0.20m - 8.00m',
      },
      detectorArtifact: 'CHATR-HOUSEHOLD-DETECTOR-V1.0',
    };
  }
}
