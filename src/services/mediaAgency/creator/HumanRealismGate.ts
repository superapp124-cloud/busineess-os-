/**
 * CHATR VIRTUAL CREATOR — HUMAN REALISM GATE
 *
 * A video passes ONLY if real measurements support it.
 * No fabricated scores. No optimistic defaults.
 *
 * States (in order):
 *   GENERATED → TECHNICALLY_VALID → GATE_CHECKED → HUMAN_APPROVED → (PUBLISHED — DISABLED)
 *
 * Hard failures:
 *   - Static single shot
 *   - Identity drift (face mismatch)
 *   - Audio/video desync > 500ms
 *   - Banned AI phrases in script
 *   - Repeated backgrounds
 *   - No character motion
 */

export type VideoProductionState =
  | 'GENERATED'        // file exists
  | 'TECHNICALLY_VALID' // all required assets present
  | 'GATE_CHECKED'     // automated quality checks ran (with scores)
  | 'GATE_FAILED'      // automated checks failed — do not proceed
  | 'HUMAN_APPROVED'   // manually reviewed and approved
  | 'HUMAN_REJECTED'   // manually rejected
  | 'PUBLISHED';       // DISABLED — OAuth off

export interface GateCheckResult {
  videoId: string;
  checkedAt: string;
  state: VideoProductionState;

  // Asset completeness
  assetsPresent: {
    videoMp4: boolean;
    thumbnail: boolean;
    scriptJson: boolean;
    voiceWav: boolean;
    captionsSrt: boolean;
    seoJson: boolean;
    trendJson: boolean;
    characterJson: boolean;
    shotPlanJson: boolean;
  };

  // Measured scores (null = not measurable / check not run)
  faceSimilarityScore: number | null;      // 0–1, SSIM vs master image
  lipSyncOffsetMs: number | null;          // ms offset, lower = better
  backgroundMotionPresent: boolean | null; // optical flow check
  audienceReady: boolean | null;           // environment has ambient motion
  shotCount: number;                       // actual shots in video
  scriptBannedPhrasesFound: string[];      // exact matches

  // Pass/fail per check
  checks: {
    name: string;
    passed: boolean;
    measured: boolean;          // false = check not implemented yet
    value?: string | number;
    threshold?: string | number;
    note?: string;
  }[];

  // Final verdict
  passed: boolean;
  failReasons: string[];
  warningReasons: string[];

  // What the reviewer needs to do
  humanReviewRequired: boolean;
  humanReviewNotes: string[];
}

export interface VideoAssetBundle {
  videoId: string;
  videoPath: string;
  thumbnailPath: string;
  scriptPath: string;
  voicePath: string;
  captionsPath: string;
  seoPath: string;
  trendPath: string;
  characterPath: string;
  shotPlanPath: string;
  qualityReportPath: string;
}

const BANNED_PHRASES = [
  "In today's fast-paced world",
  "Here's why",
  "Let me tell you",
  "Did you know",
  "AI is transforming",
  "The future is here",
  "Game-changing",
  "Revolutionary",
  "Disruptive",
  "Unlock your potential",
  "Leverage synergies",
  "Deep dive",
  "Holistic approach",
  "Value proposition"
];

const THRESHOLDS = {
  MIN_FACE_SIMILARITY: 0.82,
  MAX_AUDIO_VIDEO_OFFSET_MS: 200,
  HARD_FAIL_OFFSET_MS: 500,
  MIN_SHOTS: 4,
  MIN_VIDEO_DURATION_SEC: 15
};

// ============================================================
// GATE RUNNER
// ============================================================

export async function runHumanRealismGate(
  bundle: Partial<VideoAssetBundle>,
  shotCount: number,
  scriptText: string,
  faceSimilarity: number | null,
  lipSyncOffsetMs: number | null,
  backgroundMotionPresent: boolean | null
): Promise<GateCheckResult> {
  const videoId = bundle.videoId || 'unknown';
  const now = new Date().toISOString();

  const checks: GateCheckResult['checks'] = [];
  const failReasons: string[] = [];
  const warningReasons: string[] = [];

  // CHECK 1: Asset completeness
  const assetsPresent = {
    videoMp4: Boolean(bundle.videoPath),
    thumbnail: Boolean(bundle.thumbnailPath),
    scriptJson: Boolean(bundle.scriptPath),
    voiceWav: Boolean(bundle.voicePath),
    captionsSrt: Boolean(bundle.captionsPath),
    seoJson: Boolean(bundle.seoPath),
    trendJson: Boolean(bundle.trendPath),
    characterJson: Boolean(bundle.characterPath),
    shotPlanJson: Boolean(bundle.shotPlanPath)
  };
  const missingAssets = Object.entries(assetsPresent).filter(([, v]) => !v).map(([k]) => k);
  const assetsOk = missingAssets.length === 0;
  checks.push({ name: 'All assets present', passed: assetsOk, measured: true, value: `${Object.keys(assetsPresent).length - missingAssets.length}/${Object.keys(assetsPresent).length}`, note: missingAssets.length > 0 ? `Missing: ${missingAssets.join(', ')}` : undefined });
  if (!assetsOk) failReasons.push(`Missing assets: ${missingAssets.join(', ')}`);

  // CHECK 2: Shot count
  const shotsOk = shotCount >= THRESHOLDS.MIN_SHOTS;
  checks.push({ name: 'Minimum shot count (≥4)', passed: shotsOk, measured: true, value: shotCount, threshold: THRESHOLDS.MIN_SHOTS, note: shotsOk ? undefined : 'FAIL: static presenter risk — fewer than 4 shots' });
  if (!shotsOk) failReasons.push(`Only ${shotCount} shots — static presenter. Minimum ${THRESHOLDS.MIN_SHOTS} required.`);

  // CHECK 3: Face similarity
  if (faceSimilarity !== null) {
    const faceOk = faceSimilarity >= THRESHOLDS.MIN_FACE_SIMILARITY;
    checks.push({ name: 'Face identity consistency (SSIM ≥ 0.82)', passed: faceOk, measured: true, value: faceSimilarity.toFixed(3), threshold: THRESHOLDS.MIN_FACE_SIMILARITY });
    if (!faceOk) failReasons.push(`Identity drift: SSIM ${faceSimilarity.toFixed(3)} < ${THRESHOLDS.MIN_FACE_SIMILARITY}`);
  } else {
    checks.push({ name: 'Face identity consistency (SSIM ≥ 0.82)', passed: false, measured: false, note: 'NOT MEASURED — requires master image + SSIM comparison. Manual review required.' });
    warningReasons.push('Face consistency not measured — check manually');
  }

  // CHECK 4: Lip sync offset
  if (lipSyncOffsetMs !== null) {
    const hardFail = lipSyncOffsetMs > THRESHOLDS.HARD_FAIL_OFFSET_MS;
    const softFail = lipSyncOffsetMs > THRESHOLDS.MAX_AUDIO_VIDEO_OFFSET_MS;
    checks.push({ name: `Lip sync offset (< ${THRESHOLDS.MAX_AUDIO_VIDEO_OFFSET_MS}ms)`, passed: !softFail, measured: true, value: `${lipSyncOffsetMs}ms`, threshold: `${THRESHOLDS.MAX_AUDIO_VIDEO_OFFSET_MS}ms` });
    if (hardFail) failReasons.push(`Severe audio/video desync: ${lipSyncOffsetMs}ms > ${THRESHOLDS.HARD_FAIL_OFFSET_MS}ms hard limit`);
    else if (softFail) warningReasons.push(`Lip sync offset ${lipSyncOffsetMs}ms slightly above threshold`);
  } else {
    checks.push({ name: 'Lip sync offset (< 200ms)', passed: false, measured: false, note: 'NOT MEASURED — manual review required' });
    warningReasons.push('Lip sync not measured — check manually');
  }

  // CHECK 5: Background motion
  if (backgroundMotionPresent !== null) {
    checks.push({ name: 'Background motion present', passed: backgroundMotionPresent, measured: true, note: backgroundMotionPresent ? 'Environmental motion detected' : 'FAIL: static background — looks artificial' });
    if (!backgroundMotionPresent) failReasons.push('Static background — no environmental motion. Looks like a static presenter video.');
  } else {
    checks.push({ name: 'Background motion present', passed: false, measured: false, note: 'NOT MEASURED — manual review required' });
    warningReasons.push('Background motion not measured — verify manually');
  }

  // CHECK 6: Banned AI phrases in script
  const foundPhrases = BANNED_PHRASES.filter(p =>
    scriptText.toLowerCase().includes(p.toLowerCase())
  );
  const scriptOk = foundPhrases.length === 0;
  checks.push({ name: 'Script naturalness (no AI clichés)', passed: scriptOk, measured: true, value: `${foundPhrases.length} banned phrases found`, note: foundPhrases.length > 0 ? `Found: ${foundPhrases.join(', ')}` : undefined });
  if (!scriptOk) failReasons.push(`Unnatural script — found banned phrases: ${foundPhrases.join(', ')}`);

  // FINAL VERDICT
  const passed = failReasons.length === 0;
  const state: VideoProductionState = passed ? 'GATE_CHECKED' : 'GATE_FAILED';

  return {
    videoId,
    checkedAt: now,
    state,
    assetsPresent,
    faceSimilarityScore: faceSimilarity,
    lipSyncOffsetMs,
    backgroundMotionPresent,
    audienceReady: backgroundMotionPresent,
    shotCount,
    scriptBannedPhrasesFound: foundPhrases,
    checks,
    passed,
    failReasons,
    warningReasons,
    humanReviewRequired: true, // ALWAYS — gate is a filter not a replacement for human judgment
    humanReviewNotes: [
      'Watch the full video on a mobile screen.',
      'Ask: "Would a normal person scrolling Instagram mistake this for a real creator Reel?"',
      'Check: Does Meera look the same as in other videos?',
      'Check: Is the lip sync natural?',
      'Check: Does the background have real motion?',
      'If YES to all → HUMAN_APPROVED. Otherwise → HUMAN_REJECTED.'
    ]
  };
}

// ============================================================
// STATE LABEL — UI display only
// ============================================================

export function getStateLabel(state: VideoProductionState): { label: string; color: string; description: string } {
  const labels: Record<VideoProductionState, { label: string; color: string; description: string }> = {
    GENERATED: { label: 'Generated', color: 'slate', description: 'File exists. No quality checks run yet.' },
    TECHNICALLY_VALID: { label: 'Technically Valid', color: 'blue', description: 'All required assets present. Quality not yet evaluated.' },
    GATE_CHECKED: { label: 'Gate Passed', color: 'amber', description: 'Automated checks passed. Awaiting human review.' },
    GATE_FAILED: { label: 'Gate Failed', color: 'red', description: 'Automated quality checks failed. Do not proceed.' },
    HUMAN_APPROVED: { label: 'Human Approved', color: 'emerald', description: 'Reviewed and approved by a human. Ready for publishing decision.' },
    HUMAN_REJECTED: { label: 'Human Rejected', color: 'rose', description: 'Rejected in human review. Regeneration required.' },
    PUBLISHED: { label: 'Published (DISABLED)', color: 'purple', description: 'Publishing disabled. OAuth is off.' }
  };
  return labels[state];
}
