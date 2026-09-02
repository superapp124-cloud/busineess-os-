"""
SimBridgeGuard — standalone Python implementation for testing.
Mirrors the TypeScript SimBridgeClient.guard() contract exactly.
"""


class MockSimState:
    def __init__(self, provenance: str, is_fallen: bool):
        self.provenance = provenance
        self.is_fallen = is_fallen


class SimBridgeGuard:
    """
    The critical gate that prevents motion skills from completing
    when the real physics engine is not authoritative.
    """
    VALID_PROVENANCES = {"MUJOCO_PHYSICS", "ISAAC_SIM_PHYSICS"}

    def __init__(self, connection_state: str, latest_state):
        self.connection_state = connection_state
        self.latest_state = latest_state

    def check(self) -> str:
        """
        Returns:
            'SIMULATION_AUTHORITY_ONLINE'     — motion commands are allowed
            'SIMULATION_AUTHORITY_UNAVAILABLE' — motion commands are BLOCKED
        """
        if self.connection_state != "CONNECTED":
            return "SIMULATION_AUTHORITY_UNAVAILABLE"

        if self.latest_state is None:
            return "SIMULATION_AUTHORITY_UNAVAILABLE"

        if self.latest_state.provenance not in self.VALID_PROVENANCES:
            return "SIMULATION_AUTHORITY_UNAVAILABLE"

        if self.latest_state.is_fallen:
            return "SIMULATION_AUTHORITY_UNAVAILABLE"

        return "SIMULATION_AUTHORITY_ONLINE"
