# Phase 3 Closure SOP: Administrative Verification & Rollback Rehearsal

This Standard Operating Procedure (SOP) details the final two operational steps required to sign off on **CHATR Lovable Exit — Production Ready**.

No code changes or database migrations are involved.

---

## 1. Gate 5: Supabase Project Ownership Check

### Instructions
1. Open: `https://supabase.com/dashboard/project/sbayuqgomlflmxgicplz`
2. Navigate to **Settings → General**:
   - Check the **Reference ID**: must match `sbayuqgomlflmxgicplz`.
   - Check **Organization**: Note the organization name.
3. Navigate to **Settings → Team**:
   - Check the list of email addresses with `Owner` or `Administrator` roles.

### Decision Criteria
- **Outcome A (Independent Ownership):** If the project belongs to your company/personal organization and you hold the Owner role, independent ownership is **CONFIRMED**.
- **Outcome B (Lovable-Managed Organization):** If the project is housed under a Lovable-managed organization, file a project transfer request via the Supabase dashboard (**Settings → General → Transfer Project**). This transfers billing and organizational control to your Supabase account. **Zero data migration, zero schema changes, zero downtime.**

---

## 2. Gate 4: Vercel Project Ownership Check

### Instructions
1. Open: `https://vercel.com/dashboard`
2. Locate the project serving `chatrchat.in` and `chatr.chat`.
3. Navigate to **Settings → Git**:
   - Verify the connected Git repository is `superapp124-cloud/busineess-os-`.
   - Verify the production branch is configured to `main`.
4. Navigate to **Deployments**:
   - Verify that you have permissions to promote deployments and trigger rollbacks.

---

## 3. Gate 6: Non-Destructive Rollback Rehearsal

### Objective
Demonstrate that any client deployment can be rolled back to a previous known-good state with zero database alterations, and record the actual recovery time.

### Step-by-Step Rehearsal Execution
1. **Identify Baseline Deployment:**
   - In Vercel Deployments, find the current **Production** deployment ID (e.g., `dpl_xxxx1`).
   - Find the immediately preceding successful deployment ID (e.g., `dpl_xxxx0`).
2. **Execute Rollback Rehearsal:**
   - Click the three dots (...) next to `dpl_xxxx0` → Select **Promote to Production** (or use **Instant Rollback** if presented).
   - Start stopwatch.
3. **Verify Rollback Switch:**
   - Refresh `https://www.chatrchat.in`.
   - Confirm the previous deployment is active and serving traffic.
   - Stop stopwatch. **Record recovery time (seconds).**
4. **Restore Target State:**
   - Promote `dpl_xxxx1` (or the latest verified build) back to Production.
   - Confirm `https://www.chatrchat.in` is healthy and communicating with Supabase.

### Acceptance Criteria
- [ ] Database state untouched (0 schema mutations, 0 data loss).
- [ ] Production site remained available throughout edge DNS/CDN switch.
- [ ] Measured recovery time documented in Phase 3 report.

---

## 4. Final Sign-Off Template

Once the above checks and rehearsal are executed, record the results below:

```markdown
### Phase 3 Final Operational Sign-Off
- **Supabase Project Ownership:** [OWN ACCOUNT / TRANSFERRED]
- **Vercel Project Ownership:** [VERIFIED]
- **Rollback Rehearsal Status:** [PASSED]
- **Measured Rollback Recovery Time:** [___] seconds
- **Production Backend:** sbayuqgomlflmxgicplz (100% untouched)
- **Lovable Exit Status:** OFFICIALLY PRODUCTION READY
```
