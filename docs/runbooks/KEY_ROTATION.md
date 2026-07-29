# Runbook: Publisher Key Rotation

**Scope**: Rotating a publisher's active signing key without invalidating historical packages.

---

## Invariants

- Packages signed with the **old key** remain permanently valid. Historical metadata is immutable.
- Packages signed with the **revoked key** after revocation will be rejected by `SignatureVerifier`.
- The `PublisherIdentityService` tracks the full certificate lifecycle.

---

## Rotation Procedure

1. **Issue a new certificate**:
   ```
   PublisherIdentityService.issueCertificate(publisherId)
   ```
   This creates a new key pair. The old key remains active until explicitly revoked.

2. **Update the publisher's active key**:
   Update `.chatr/publisher.json` with the new `activeKeyId`.

3. **Verify the new key works** by running a test publish:
   ```bash
   chatr build && chatr sign && chatr publish --dry-run
   ```

4. **Revoke the old certificate**:
   ```
   CertificateLifecycle.revokeCertificate(oldCertId)
   ```

5. **Audit log**: Record the rotation in `ComplianceAuditor`:
   ```ts
   await auditor.record({ action: 'KEY_ROTATION', actor: publisherId, result: 'SUCCESS', policyVersion: activePolicy.version })
   ```

---

## Emergency Revocation (Key Compromise)

If a key is compromised:
1. Immediately call `PublisherIdentityService.revokeCertificate(compromisedCertId)`
2. Raise a `CRITICAL` incident in `IncidentManager`
3. Notify affected platform operators
4. Issue a new certificate and re-sign affected packages
