/**
 * CHATR Media Agency — Multi-Source Video Generation Adapter
 * 
 * Supports 3 distinct video source pipelines for true moving footage:
 * - SOURCE A: Curated/Licensed Moving Human Footage (High-speed, zero marginal cost)
 * - SOURCE B: Local Open-Source Generative Pipeline (AnimateDiff / Wan2.1 / LivePortrait / Wav2Lip)
 * - SOURCE C: External High-Fidelity Video Provider APIs (Runway Gen-3, Kling AI, Luma Dream Machine, Minimax)
 */

export type VideoSourceType = 'LICENSED_REAL_FOOTAGE' | 'LOCAL_OPENSOURCE_GEN' | 'CLOUD_GEN_PROVIDER';

export interface VideoSourceDescriptor {
  sourceType: VideoSourceType;
  providerName: string;
  isAvailable: boolean;
  marginalCostEstimate: string;
  temporalQualityTier: 'ULTRA_PHOTOREALISTIC' | 'HIGH_GEN_MOTION' | 'CLEAN_STOCK_MOTION';
  description: string;
}

export class VideoGenerationAdapter {
  private static AVAILABLE_SOURCES: VideoSourceDescriptor[] = [
    {
      sourceType: 'LICENSED_REAL_FOOTAGE',
      providerName: 'Mixkit & Pexels CC0 Commercial Library',
      isAvailable: true,
      marginalCostEstimate: '₹0.00 / video',
      temporalQualityTier: 'ULTRA_PHOTOREALISTIC',
      description: 'Real moving human actors walking, talking, laughing, interacting in authentic street/cafe environments.'
    },
    {
      sourceType: 'LOCAL_OPENSOURCE_GEN',
      providerName: 'Local LivePortrait + Wav2Lip + Wan2.1 Engine',
      isAvailable: true,
      marginalCostEstimate: '₹0.00 (Local GPU Compute)',
      temporalQualityTier: 'HIGH_GEN_MOTION',
      description: 'Local deepfake/lip-sync and motion generation driven by vocal audio waveforms.'
    },
    {
      sourceType: 'CLOUD_GEN_PROVIDER',
      providerName: 'Kling AI / Runway Gen-3 / Luma Dream Machine',
      isAvailable: true,
      marginalCostEstimate: '~$0.05 / 5s generation',
      temporalQualityTier: 'ULTRA_PHOTOREALISTIC',
      description: 'Commercial cloud generative video APIs for dynamic cinematic scene synthesis.'
    }
  ];

  public static getSources(): VideoSourceDescriptor[] {
    return this.AVAILABLE_SOURCES;
  }
}
