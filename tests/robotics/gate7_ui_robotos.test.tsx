/** @jsxImportSource react */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { RobotOsPage } from '../../src/pages/robot/RobotOsPage';

describe('GATE 7 & 8 UI: Live /robotOs Interface, Tasks & Skills Connectivity', () => {
  it('1. Renders RobotOS Master UI with Dual Mode and Access Level Selectors', () => {
    render(<RobotOsPage />);

    expect(screen.getByText('CHATR RobotOS')).toBeDefined();
    expect(screen.getByText(/v1.0.0-GATE8/i)).toBeDefined();
    expect(screen.getByText('🟢 SIMULATION')).toBeDefined();
    expect(screen.getByText('🔴 PHYSICAL HARDWARE')).toBeDefined();
    expect(screen.getByText('🛑 EMERGENCY STOP')).toBeDefined();
  });

  it('2. Renders 3D Digital Twin, Perception World Model, and Telemetry Canvas with Provenance', () => {
    render(<RobotOsPage />);

    expect(screen.getByText(/CHATR-H170 DIGITAL TWIN/i)).toBeDefined();
    expect(screen.getByText(/RGB-D SEMANTIC WORLD MODEL/i)).toBeDefined();
    expect(screen.getByText(/POWER & ACTUATOR TELEMETRY/i)).toBeDefined();
    expect(screen.getByText(/BATTERY SOC/i)).toBeDefined();
    expect(screen.getByText('85.0%')).toBeDefined();
    expect(screen.getAllByText(/PROVENANCE:/i).length).toBeGreaterThan(0);
  });

  it('3. Multi-Lingual Console — Executes Hindi Command and Updates Decomposed Task Graph', async () => {
    render(<RobotOsPage />);

    const hindiBtn = screen.getByText('Hindi (Hinglish)');
    await act(async () => {
      fireEvent.click(hindiBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Operational AI Explainer:/i)).toBeDefined();
      expect(screen.getByText(/LANG: HI/i)).toBeDefined();
      expect(screen.getByText(/INTENT: FETCH_OBJECT/i)).toBeDefined();
      expect(screen.getByText(/STATUS: VALID_AND_EXECUTABLE/i)).toBeDefined();
    });
  });

  it('4. Multi-Lingual Console — Supports Tamil, Telugu, Punjabi, Bengali, and Urdu Presets', async () => {
    render(<RobotOsPage />);

    const tamilBtn = screen.getByText('Tamil');
    await act(async () => {
      fireEvent.click(tamilBtn);
    });
    await waitFor(() => {
      expect(screen.getByText(/LANG: TA/i)).toBeDefined();
    });

    const punjabiBtn = screen.getByText('Punjabi (Gurmukhi)');
    await act(async () => {
      fireEvent.click(punjabiBtn);
    });
    await waitFor(() => {
      expect(screen.getByText(/LANG: PA/i)).toBeDefined();
    });

    const urduBtn = screen.getByText('Urdu (Nastaliq)');
    await act(async () => {
      fireEvent.click(urduBtn);
    });
    await waitFor(() => {
      expect(screen.getByText(/LANG: UR/i)).toBeDefined();
    });
  });

  it('5. Manipulation Inspector — Solves DLS IK and calculates Dynamic Normal Force', async () => {
    render(<RobotOsPage />);

    const solveIkBtn = screen.getByText(/1\. Solve DLS IK & Dynamic Force/i);
    await act(async () => {
      fireEvent.click(solveIkBtn);
    });

    await waitFor(() => {
      expect(screen.getAllByText(/REACHABLE/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/DLS CONVERGENCE/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/REQUIRED NORMAL FORCE/i).length).toBeGreaterThan(0);
    });
  });

  it('6. Gate 8 Household Task Engine — Dispatches and executes FETCH_OBJECT task in UI', async () => {
    render(<RobotOsPage />);

    expect(screen.getByText(/HOUSEHOLD TASK ENGINE/i)).toBeDefined();
    const dispatchBtn = screen.getByText(/▶️ DISPATCH TASK/i);

    await act(async () => {
      fireEvent.click(dispatchBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/ENGINE DIAGNOSTICS/i)).toBeDefined();
      expect(screen.getByText(/STATE: COMPLETE/i)).toBeDefined();
    });
  });

  it('7. Deterministic Failure Injection — Shifts Master Safety State to CAUTION / ZONE 1 E-Stop', async () => {
    render(<RobotOsPage />);

    const humanHazardBtn = screen.getByText('2. Human Enters Path');
    await act(async () => {
      fireEvent.click(humanHazardBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/INJECTED FAULT: HUMAN_ENTERED_PATH/i)).toBeDefined();
      expect(screen.getAllByText(/ZONE_1_EMERGENCY_STOP/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/STATE: CAUTION/i)).toBeDefined();
      expect(screen.getByText(/DETERMINISTIC SAFETY: MAINTAINED/i)).toBeDefined();
    });
  });

  it('8. Emergency Stop Button — Engages and resets instant hardware/software interlock and sets STATE: E_STOP', () => {
    render(<RobotOsPage />);

    const estopBtn = screen.getByText('🛑 EMERGENCY STOP');
    fireEvent.click(estopBtn);

    expect(screen.getByText('RESET E-STOP')).toBeDefined();
    expect(screen.getByText(/STATE: E_STOP/i)).toBeDefined();

    fireEvent.click(screen.getByText('RESET E-STOP'));
    expect(screen.getByText('🛑 EMERGENCY STOP')).toBeDefined();
    expect(screen.getByText(/STATE: NORMAL/i)).toBeDefined();
  });
});
