# Capability Authoring Guide

This guide walks a third-party developer through the complete lifecycle of building, validating, and publishing a capability on the CHATR Intent OS platform.

## The Capability Lifecycle

```
scaffold → build → lint → validate → test → conformance → certify → package → sign → publish
```

---

## Step 1: Scaffold

```bash
chatr new my-capability
```

This creates:
```
my-capability/
  manifest.ts      # Capability manifest (source of truth)
  README.md
  CONFORMANCE.md
```

---

## Step 2: Define Your Manifest

Every capability must define a manifest using the `CapabilityBuilder` from `@chatr/sdk`:

```typescript
import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('my-capability')
  .version(1, 0, 0)
  .publisher('acme', 'Acme Corp')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'MyCapability.DoSomething',
    name: 'Do Something',
    description: 'What this action accomplishes',
    inputSchema: { type: 'object', properties: { input: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { result: { type: 'string' } } }
  })
  .build();
```

**Rules:**
- `publisher` namespace must be registered with the CHATR Publisher Identity Service.
- `minimumKernelVersion` must be accurate — the Compatibility Matrix enforces this at install time.

---

## Step 3: Validate & Lint

```bash
chatr lint      # Structural validation
chatr validate  # Schema and contract validation against Kernel contracts
```

---

## Step 4: Run Conformance

```bash
chatr test --conformance
```

All five conformance rules must pass:
1. **ContractRule** — Manifest follows `CapabilityManifest` schema
2. **ExecutionRule** — Actions declare proper input/output schemas
3. **PolicyRule** — Capability declares policy hooks
4. **EventRule** — Emits required lifecycle events
5. **CompatibilityRule** — Minimum kernel version declared

---

## Step 5: Certify

```bash
chatr certify --capability ./
```

This runs the full 8-stage certification pipeline (Type Check → Conformance → Stress → Security → Performance → Compatibility → Certification Report).

A `CertificationReport.json` is generated. The `verdict` must be `CERTIFIED` before publishing.

---

## Step 6: Package, Sign & Publish

```bash
chatr build    # Produce the canonical archive
chatr pack     # Bundle into .tar
chatr sign     # Generate Ed25519 signature over SHA-256 digest
chatr publish  # Submit to Intent Store
```

**Invariant**: The Intent Store will reject any archive without a verified signature.
