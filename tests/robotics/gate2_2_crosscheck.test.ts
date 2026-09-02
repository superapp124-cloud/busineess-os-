import { describe, it, expect } from 'vitest';
import { IndependentEngineeringCrossCheck } from '../../packages/robot-profiles/src';

describe('GATE 2.2: Independent Engineering Cross-Check & Assumption Register', () => {
  // ------------------------------------------------------------
  // 1. Independent Mass & COM First-Principles Calculation
  // ------------------------------------------------------------
  it('1. Independently calculates mass and standing COM from raw geometric matrices without loading robot.json', () => {
    const result = IndependentEngineeringCrossCheck.computeIndependentMassAndCom();

    expect(result.totalMassKg).toBe(68.0);
    // Standing COM Z-height: 51.2% of 1.75m height = 0.896m (within 0.88m to 0.95m range)
    expect(result.comMeters.z).toBeGreaterThan(0.88);
    expect(result.comMeters.z).toBeLessThan(0.95);
    expect(Math.abs(result.comMeters.y)).toBeLessThan(0.001); // Medial-lateral symmetry
  });

  // ------------------------------------------------------------
  // 2. Actuator Sizing after Gearbox Efficiency Losses
  // ------------------------------------------------------------
  it('2. Evaluates motor operating points accounting for 80-88% gearbox efficiency and speed limits', () => {
    const operatingPoints = IndependentEngineeringCrossCheck.calculateMotorOperatingPoints();
    expect(operatingPoints.length).toBeGreaterThanOrEqual(12);

    for (const point of operatingPoints) {
      // Motor speed must not exceed maximum RPM limits
      expect(point.requiredMotorSpeedRpm).toBeLessThan(6500);
      // Motor continuous torque must remain under 2.5 Nm
      expect(point.requiredMotorTorqueNm).toBeLessThan(2.5);
      expect(point.isWithinSpeedTorqueEnvelope).toBe(true);
      expect(point.motorElectricalPowerWatts).toBeGreaterThan(point.motorMechanicalPowerWatts);
    }

    // Specific knee check under 160 Nm output load
    const knee = operatingPoints.find((p) => p.jointId === 'l_knee_pitch')!;
    expect(knee.gearRatio).toBe(130);
    expect(knee.gearEfficiency).toBe(0.82);
    // Motor rotor torque required = 160 / (130 * 0.82) = 1.501 Nm
    expect(knee.requiredMotorTorqueNm).toBeCloseTo(1.501, 2);
    // Motor current = 1.501 / 0.28 = 5.36 A
    expect(knee.motorCurrentAmperes).toBeCloseTo(5.36, 1);
  });

  // ------------------------------------------------------------
  // 3. Electrical Power Budget & Battery C-Rate Safety
  // ------------------------------------------------------------
  it('3. Audits electrical power budget, copper losses, inverter efficiency, and C-rate safety', () => {
    const audit = IndependentEngineeringCrossCheck.auditElectricalPowerBudget();
    expect(audit.length).toBe(5);

    for (const scenario of audit) {
      expect(scenario.totalElectricalWatts).toBeGreaterThan(0);
      expect(scenario.batteryCRate).toBeLessThan(2.0); // Safe continuous discharge limit
      expect(scenario.isCRateSafe).toBe(true);
      expect(scenario.effectiveTerminalVoltage).toBeGreaterThan(45.0); // Minimal voltage sag
    }

    const walking = audit.find((s) => s.mode === 'ACTIVE_WALKING')!;
    // Walking power around 280-320W -> ~6.0-6.6A at 48V -> ~0.20-0.22 C-rate
    expect(walking.totalElectricalWatts).toBeGreaterThan(250.0);
    expect(walking.totalElectricalWatts).toBeLessThan(350.0);
    expect(walking.batteryCRate).toBeLessThan(0.30);
    expect(walking.runtimeHours).toBeGreaterThan(4.0);
  });

  // ------------------------------------------------------------
  // 4. Formal Structured Assumption Register Completeness
  // ------------------------------------------------------------
  it('4. Verifies completeness and integrity of the formal Assumption Register', () => {
    const register = IndependentEngineeringCrossCheck.getAssumptionRegister();
    expect(register.length).toBeGreaterThanOrEqual(6);

    for (const record of register) {
      expect(record.id).toMatch(/^ASSUMP-[A-Z]+-\d{3}$/);
      expect(record.componentName.length).toBeGreaterThan(0);
      expect(record.parameterClaim.length).toBeGreaterThan(0);
      expect(['MODEL', 'ESTIMATE', 'COTS_BENCHMARK']).toContain(record.sourceType);
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(record.confidence);
      expect(record.requiredPhysicalVerification.length).toBeGreaterThan(15);
      expect(record.costImpactINR.length).toBeGreaterThan(0);
    }

    // Knee actuator assumption check
    const kneeAssump = register.find((r) => r.id === 'ASSUMP-ACT-001')!;
    expect(kneeAssump.cotsReference).toContain('T-Motor');
    expect(kneeAssump.confidence).toBe('MEDIUM');

    // Battery pack assumption check
    const batAssump = register.find((r) => r.id === 'ASSUMP-BAT-001')!;
    expect(batAssump.cotsReference).toContain('LiFePO4');
    expect(batAssump.confidence).toBe('HIGH');
  });
});
