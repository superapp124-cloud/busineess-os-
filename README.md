# CHATR Platform v0.9.0-rc

![CHATR Architecture](docs/architecture.png)

CHATR is an Intent Operating System that replaces traditional app-centric workflows with a unified, intent-driven execution pipeline. 

The architecture is designed to understand user intent, parallelize provider discovery, resolve sessions securely, build idempotent transactions, execute payments, and track live order status—all through a single, generic execution runtime.

## Platform Status
- **Architecture**: COMPLETE
- **Kernel**: FEATURE COMPLETE
- **ABI**: FROZEN
- **Reality Level**: L1 (Mock Connector Validation)
- **Primary Focus**: Production Provider Integrations

## Frozen ABIs
The following core ABIs are frozen. Any changes require an Architecture Decision Record (ADR) and explicit approval from the Technical Steering Committee:
- `chatr.discovery_result.v0_9_rc`
- `chatr.provider_session.v0_9_rc`
- `chatr.transaction.v0_9_rc`
- `chatr.workflow_graph.v0_9_rc`
- `chatr.provider_manifest.v0_9_rc`
- `chatr.connector_interface`

## Execution Pipeline
1. **User Intent** — Natural language or structured input
2. **Intent Engine** — Parses and understands the intent
3. **Context Engine** — Resolves location, time, history
4. **Goal Planner** — Creates the execution goal
5. **Discovery Engine** — Parallel provider search across the Connector Registry
6. **Ranking Engine** — Scores and explains results
7. **Provider Selection** — Picks the best provider
8. **Session Platform** — Authenticates and reuses sessions securely
9. **Transaction Engine** — Builds idempotent transactions
10. **Payment Engine** — Dispatches payment
11. **Verification Engine** — Confirms with the provider
12. **Tracking** — Live status polling

## Next Steps: Sprint 1
Engineering effort is now directed toward **Real Provider Integrations** (L3/L4 Reality Level), starting with:
- Real Zomato Integration
- Real Swiggy Integration
- Browser Runtime Automation

*Note: All future Pull Requests must make a real user task more reliable, faster, or easier to complete.*
