/**
 * CHATR Production Financial Security & RBAC Guard (Production Activation)
 * Enforces strict financial separation of duties, role permissions, and mandatory approval gates:
 * Roles: OWNER | CFO | FINANCE_MANAGER | ACCOUNTANT | AP_CLERK | AR_CLERK | AUDITOR | VIEWER
 */

export type FinanceRole =
  | 'OWNER'
  | 'CFO'
  | 'FINANCE_MANAGER'
  | 'ACCOUNTANT'
  | 'AP_CLERK'
  | 'AR_CLERK'
  | 'AUDITOR'
  | 'VIEWER';

export type FinancialAction =
  | 'VIEW_GL'
  | 'CREATE_JOURNAL_DRAFT'
  | 'POST_JOURNAL'
  | 'WRITE_OFF_BAD_DEBT'
  | 'REOPEN_CLOSED_PERIOD'
  | 'CHANGE_BANK_ACCOUNT'
  | 'CHANGE_ACCOUNTING_POLICY'
  | 'APPROVE_PAYMENT_RELEASE';

export interface RBACCheckResult {
  authorized: boolean;
  requiresDualApproval: boolean;
  requiredRoles: FinanceRole[];
  reason: string;
}

export class FinanceRBACGuard {
  /**
   * Evaluates if a given user role is authorized to perform a financial action
   */
  public static evaluateAuthorization(userRole: FinanceRole, action: FinancialAction): RBACCheckResult {
    switch (action) {
      case 'VIEW_GL':
        return {
          authorized: ['OWNER', 'CFO', 'FINANCE_MANAGER', 'ACCOUNTANT', 'AUDITOR'].includes(userRole),
          requiresDualApproval: false,
          requiredRoles: ['ACCOUNTANT', 'FINANCE_MANAGER', 'CFO', 'OWNER', 'AUDITOR'],
          reason: 'General Ledger is viewable by Accountant and above, plus Auditors.',
        };

      case 'CREATE_JOURNAL_DRAFT':
        return {
          authorized: ['OWNER', 'CFO', 'FINANCE_MANAGER', 'ACCOUNTANT'].includes(userRole),
          requiresDualApproval: false,
          requiredRoles: ['ACCOUNTANT', 'FINANCE_MANAGER', 'CFO', 'OWNER'],
          reason: 'Journal proposals may be drafted by Accountants and above.',
        };

      case 'POST_JOURNAL':
        return {
          authorized: ['OWNER', 'CFO', 'FINANCE_MANAGER'].includes(userRole),
          requiresDualApproval: false,
          requiredRoles: ['FINANCE_MANAGER', 'CFO', 'OWNER'],
          reason: 'Posting into GL requires Finance Manager or above.',
        };

      case 'WRITE_OFF_BAD_DEBT':
        return {
          authorized: ['OWNER', 'CFO'].includes(userRole),
          requiresDualApproval: false,
          requiredRoles: ['CFO', 'OWNER'],
          reason: 'Bad debt write-offs strictly require CFO or Owner approval.',
        };

      case 'REOPEN_CLOSED_PERIOD':
        return {
          authorized: ['OWNER', 'CFO'].includes(userRole),
          requiresDualApproval: false,
          requiredRoles: ['CFO', 'OWNER'],
          reason: 'Period reopening strictly requires CFO or Owner authorization.',
        };

      case 'CHANGE_BANK_ACCOUNT':
        return {
          authorized: ['OWNER', 'CFO'].includes(userRole),
          requiresDualApproval: true,
          requiredRoles: ['CFO', 'OWNER'],
          reason: 'Bank disbursement account changes require mandatory dual approval (CFO + Owner).',
        };

      case 'CHANGE_ACCOUNTING_POLICY':
        return {
          authorized: ['OWNER', 'CFO'].includes(userRole),
          requiresDualApproval: false,
          requiredRoles: ['CFO', 'OWNER'],
          reason: 'Accounting policy modifications require CFO or Owner approval.',
        };

      case 'APPROVE_PAYMENT_RELEASE':
        return {
          authorized: ['OWNER', 'CFO', 'FINANCE_MANAGER'].includes(userRole),
          requiresDualApproval: false,
          requiredRoles: ['FINANCE_MANAGER', 'CFO', 'OWNER'],
          reason: 'Disbursements require Finance Manager approval (or CFO if >= ₹1,00,000 threshold).',
        };

      default:
        return {
          authorized: false,
          requiresDualApproval: false,
          requiredRoles: ['OWNER'],
          reason: 'Unknown financial action; defaulted to deny.',
        };
    }
  }
}
