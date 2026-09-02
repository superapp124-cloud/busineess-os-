"""
Cross Validator — standalone Python (mirrors TypeScript CrossValidator in robot-physics).
Used by Gate 8.5 tests. Compares reference FK positions against physics engine output.
"""


class CrossValidator:
    DIVERGENCE_THRESHOLD_PERCENT = 5.0

    @staticmethod
    def validate_standalone(
        reference_positions: dict[str, float],
        sim_joint_states: dict[str, dict],
    ) -> dict:
        """
        Compare reference positions against simulator joint states.
        sim_joint_states: { joint_id: { "posRad": float } }
        """
        results = []
        diverged_joints = []
        max_div = 0.0

        for joint, ref_val in reference_positions.items():
            sim_entry = sim_joint_states.get(joint)
            if not sim_entry:
                continue

            sim_val = float(sim_entry["posRad"])
            denominator = max(abs(ref_val), 0.01)
            diverge_pct = (abs(sim_val - ref_val) / denominator) * 100.0
            is_diverged = diverge_pct > CrossValidator.DIVERGENCE_THRESHOLD_PERCENT

            if is_diverged:
                diverged_joints.append(joint)
            if diverge_pct > max_div:
                max_div = diverge_pct

            results.append({
                "joint":               joint,
                "reference_value_rad": ref_val,
                "simulator_value_rad": sim_val,
                "divergence_percent":  diverge_pct,
                "is_diverged":         is_diverged,
            })

        return {
            "is_valid":                len(diverged_joints) == 0,
            "max_divergence_percent":  max_div,
            "diverged_joints":         diverged_joints,
            "results":                 results,
        }
