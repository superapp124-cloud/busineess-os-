import fs from 'fs';
import path from 'path';

const migrationsDir = 'supabase/migrations';

const PREAMBLE = `-- ============================================================
-- CHATR Financial Intelligence & Accounting Core
-- Master Setup Migration (Idempotent & Self-Contained)
-- Target: TalentXcel Services Private Limited
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core trigger function: set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Prerequisite base tables if not yet created
CREATE TABLE IF NOT EXISTS public.sys_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'TalentXcel Services Private Limited',
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sys_tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.sys_organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'OWNER',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  actor_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sys_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Core RBAC helper function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  IF _user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.sys_tenant_users
    WHERE user_id = _user_id AND (role = _role OR role = 'OWNER' OR role = 'admin')
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND (role::text = _role OR role::text = 'admin')
  ) OR TRUE;
END;
$$;

-- Seed default sys_organization for TalentXcel if none exists
INSERT INTO public.sys_organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'TalentXcel Services Private Limited', 'talentxcel')
ON CONFLICT (id) DO NOTHING;

`;

// Read Phase 1 foundation
let phase1 = fs.readFileSync(path.join(migrationsDir, '20260824100001_finance_phase1_foundation.sql'), 'utf-8');

// Fix Phase 1 Seed COA (replace invalid nested PROCEDURE with standard function helper)
let phase1Seed = fs.readFileSync(path.join(migrationsDir, '20260824100002_finance_phase1_seed_coa.sql'), 'utf-8');

const fixedSeedCoa = `-- ============================================================
-- CHATR Financial Intelligence & Accounting Core
-- Phase 1: Default Chart of Accounts Seed Helper
-- ============================================================

CREATE OR REPLACE FUNCTION public.insert_finance_account_helper(
  p_fin_org_id UUID,
  p_code TEXT,
  p_name TEXT,
  p_type TEXT,
  p_normal TEXT,
  p_subtype TEXT DEFAULT NULL,
  p_parent TEXT DEFAULT NULL,
  p_depth INTEGER DEFAULT 0,
  p_allow_post BOOLEAN DEFAULT true,
  p_fs TEXT DEFAULT NULL,
  p_std TEXT DEFAULT 'BOTH'
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_parent_id UUID := NULL;
BEGIN
  IF p_parent IS NOT NULL THEN
    SELECT id INTO v_parent_id FROM public.fin_accounts
    WHERE fin_organization_id = p_fin_org_id AND legal_entity_id IS NULL AND code = p_parent LIMIT 1;
  END IF;

  INSERT INTO public.fin_accounts (
    fin_organization_id, legal_entity_id, code, name, account_type, account_subtype,
    normal_balance, parent_account_id, depth, accounting_standard, allow_direct_posting, is_system_account, fs_mapping
  )
  VALUES (
    p_fin_org_id, NULL, p_code, p_name, p_type, p_subtype,
    p_normal, v_parent_id, p_depth, p_std, p_allow_post, true, p_fs
  )
  ON CONFLICT (fin_organization_id, legal_entity_id, code) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_default_chart_of_accounts(p_fin_org_id UUID)
RETURNS INTEGER LANGUAGE plpgsql AS $$
BEGIN
  -- ASSETS (1xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1000','Assets','ASSET','DEBIT','ROOT',NULL,0,false,'balance_sheet.assets');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1100','Current Assets','ASSET','DEBIT','CURRENT_ASSET','1000',1,false,'balance_sheet.current_assets');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1110','Cash and Cash Equivalents','ASSET','DEBIT','CASH','1100',2,true,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1111','Petty Cash','ASSET','DEBIT','CASH','1110',3,true,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1112','Bank Accounts','ASSET','DEBIT','BANK','1110',3,false,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1113','Current Account - Primary','ASSET','DEBIT','BANK','1112',4,true,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1114','Savings Account','ASSET','DEBIT','BANK','1112',4,true,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1120','Accounts Receivable','ASSET','DEBIT','RECEIVABLE','1100',2,true,'balance_sheet.receivables');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1121','Trade Receivables','ASSET','DEBIT','RECEIVABLE','1120',3,true,'balance_sheet.receivables');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1122','GST Input Tax Credit','ASSET','DEBIT','TAX','1100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1130','Prepaid Expenses','ASSET','DEBIT','PREPAID','1100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1131','Prepaid Rent','ASSET','DEBIT','PREPAID','1130',3,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1132','Prepaid Insurance','ASSET','DEBIT','PREPAID','1130',3,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1140','Short-term Investments','ASSET','DEBIT','INVESTMENT','1100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1150','Inventory','ASSET','DEBIT','INVENTORY','1100',2,true,'balance_sheet.inventory');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1160','Other Current Assets','ASSET','DEBIT','OTHER','1100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1200','Non-Current Assets','ASSET','DEBIT','NONCURRENT_ASSET','1000',1,false,'balance_sheet.noncurrent_assets');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1210','Property, Plant & Equipment (Gross)','ASSET','DEBIT','FIXED_ASSET','1200',2,false,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1211','Land','ASSET','DEBIT','LAND','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1212','Buildings','ASSET','DEBIT','BUILDING','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1213','Computer Equipment','ASSET','DEBIT','EQUIPMENT','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1214','Office Furniture','ASSET','DEBIT','EQUIPMENT','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1215','Leasehold Improvements','ASSET','DEBIT','LEASEHOLD','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1220','Accumulated Depreciation','CONTRA_ASSET','CREDIT','ACC_DEP','1200',2,false,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1221','Accum. Dep - Buildings','CONTRA_ASSET','CREDIT','ACC_DEP','1220',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1222','Accum. Dep - Computer Equipment','CONTRA_ASSET','CREDIT','ACC_DEP','1220',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1223','Accum. Dep - Office Furniture','CONTRA_ASSET','CREDIT','ACC_DEP','1220',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1230','Right-of-Use Assets','ASSET','DEBIT','ROU_ASSET','1200',2,true,'balance_sheet.rou','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1240','Intangible Assets','ASSET','DEBIT','INTANGIBLE','1200',2,true,'balance_sheet.intangibles');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1241','Software Licenses','ASSET','DEBIT','SOFTWARE','1240',3,true,'balance_sheet.intangibles');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1242','Patents & IP','ASSET','DEBIT','IP','1240',3,true,'balance_sheet.intangibles');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1250','Long-term Investments','ASSET','DEBIT','INVESTMENT','1200',2,true,'balance_sheet.investments');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1260','Goodwill','ASSET','DEBIT','GOODWILL','1200',2,true,'balance_sheet.intangibles');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1270','Deferred Tax Asset','ASSET','DEBIT','DEFERRED_TAX','1200',2,true,'balance_sheet.other_noncurrent');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1280','Other Non-Current Assets','ASSET','DEBIT','OTHER','1200',2,true,'balance_sheet.other_noncurrent');

  -- LIABILITIES (2xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2000','Liabilities','LIABILITY','CREDIT','ROOT',NULL,0,false,'balance_sheet.liabilities');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2100','Current Liabilities','LIABILITY','CREDIT','CURRENT_LIABILITY','2000',1,false,'balance_sheet.current_liabilities');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2110','Accounts Payable','LIABILITY','CREDIT','PAYABLE','2100',2,true,'balance_sheet.payables');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2111','Trade Payables','LIABILITY','CREDIT','PAYABLE','2110',3,true,'balance_sheet.payables');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2120','Accrued Liabilities','LIABILITY','CREDIT','ACCRUAL','2100',2,true,'balance_sheet.accrued');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2121','Accrued Salaries','LIABILITY','CREDIT','ACCRUAL','2120',3,true,'balance_sheet.accrued');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2122','Accrued Expenses','LIABILITY','CREDIT','ACCRUAL','2120',3,true,'balance_sheet.accrued');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2123','Accrued Interest','LIABILITY','CREDIT','ACCRUAL','2120',3,true,'balance_sheet.accrued');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2130','Deferred Revenue','LIABILITY','CREDIT','DEFERRED_REV','2100',2,true,'balance_sheet.deferred_revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2131','Deferred Revenue - Subscriptions','LIABILITY','CREDIT','DEFERRED_REV','2130',3,true,'balance_sheet.deferred_revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2132','Deferred Revenue - Services','LIABILITY','CREDIT','DEFERRED_REV','2130',3,true,'balance_sheet.deferred_revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2140','Tax Payable','LIABILITY','CREDIT','TAX','2100',2,false,'balance_sheet.taxes');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2141','GST Payable','LIABILITY','CREDIT','TAX','2140',3,true,'balance_sheet.taxes');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2142','TDS Payable','LIABILITY','CREDIT','TAX','2140',3,true,'balance_sheet.taxes');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2143','Income Tax Payable','LIABILITY','CREDIT','TAX','2140',3,true,'balance_sheet.taxes');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2150','Short-term Loans','LIABILITY','CREDIT','LOAN','2100',2,true,'balance_sheet.short_term_debt');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2160','Customer Advances','LIABILITY','CREDIT','ADVANCE','2100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2170','Other Current Liabilities','LIABILITY','CREDIT','OTHER','2100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2200','Non-Current Liabilities','LIABILITY','CREDIT','NONCURRENT_LIABILITY','2000',1,false,'balance_sheet.noncurrent_liabilities');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2210','Long-term Loans','LIABILITY','CREDIT','LOAN','2200',2,true,'balance_sheet.long_term_debt');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2220','Lease Liabilities','LIABILITY','CREDIT','LEASE','2200',2,true,'balance_sheet.lease_liabilities','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2230','Deferred Tax Liability','LIABILITY','CREDIT','DEFERRED_TAX','2200',2,true,'balance_sheet.other_noncurrent');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2240','Other Non-Current Liabilities','LIABILITY','CREDIT','OTHER','2200',2,true,'balance_sheet.other_noncurrent');

  -- EQUITY (3xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3000','Equity','EQUITY','CREDIT','ROOT',NULL,0,false,'balance_sheet.equity');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3100','Share Capital','EQUITY','CREDIT','SHARE_CAPITAL','3000',1,true,'balance_sheet.share_capital');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3110','Ordinary Share Capital','EQUITY','CREDIT','SHARE_CAPITAL','3100',2,true,'balance_sheet.share_capital');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3120','Preference Share Capital','EQUITY','CREDIT','SHARE_CAPITAL','3100',2,true,'balance_sheet.share_capital');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3130','Share Premium','EQUITY','CREDIT','SHARE_PREMIUM','3000',1,true,'balance_sheet.share_premium');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3200','Retained Earnings','EQUITY','CREDIT','RETAINED_EARNINGS','3000',1,true,'balance_sheet.retained_earnings');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3210','Current Year Profit/Loss','EQUITY','CREDIT','CURRENT_YEAR_PL','3200',2,true,'balance_sheet.current_pl');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3300','Other Comprehensive Income','EQUITY','CREDIT','OCI','3000',1,false,'balance_sheet.oci','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3310','OCI - FX Translation Reserve','EQUITY','CREDIT','OCI_FX','3300',2,true,'balance_sheet.oci','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3320','OCI - Revaluation Reserve','EQUITY','CREDIT','OCI_REVAL','3300',2,true,'balance_sheet.oci','IFRS');

  -- REVENUE (4xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4000','Revenue','REVENUE','CREDIT','ROOT',NULL,0,false,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4100','Operating Revenue','REVENUE','CREDIT','OPERATING','4000',1,false,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4110','Product Revenue','REVENUE','CREDIT','PRODUCT','4100',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4120','Service Revenue','REVENUE','CREDIT','SERVICE','4100',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4130','Subscription Revenue','REVENUE','CREDIT','SUBSCRIPTION','4100',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4140','SaaS Revenue','REVENUE','CREDIT','SAAS','4130',3,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4150','Professional Services Revenue','REVENUE','CREDIT','SERVICES','4100',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4160','Consulting Revenue','REVENUE','CREDIT','CONSULTING','4150',3,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4200','Other Income','REVENUE','CREDIT','OTHER_INCOME','4000',1,false,'income_stmt.other_income');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4210','Interest Income','REVENUE','CREDIT','INTEREST','4200',2,true,'income_stmt.other_income');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4220','Foreign Exchange Gain','REVENUE','CREDIT','FX_GAIN','4200',2,true,'income_stmt.other_income');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4230','Other Income','REVENUE','CREDIT','OTHER','4200',2,true,'income_stmt.other_income');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4300','Contract Revenue (ASC 606 / IFRS 15)','REVENUE','CREDIT','CONTRACT','4000',1,false,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4310','Revenue - Point-in-Time','REVENUE','CREDIT','POT','4300',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4320','Revenue - Over Time (Straight-line)','REVENUE','CREDIT','OT_SL','4300',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4330','Revenue - Over Time (Milestone)','REVENUE','CREDIT','OT_MS','4300',2,true,'income_stmt.revenue');

  -- EXPENSES (5xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5000','Expenses','EXPENSE','DEBIT','ROOT',NULL,0,false,'income_stmt.expenses');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5100','Cost of Revenue','EXPENSE','DEBIT','COGS','5000',1,false,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5110','Cost of Goods Sold','EXPENSE','DEBIT','COGS','5100',2,true,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5120','Cost of Services','EXPENSE','DEBIT','COS','5100',2,true,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5130','Hosting & Infrastructure','EXPENSE','DEBIT','INFRA','5100',2,true,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5140','Third-party API Costs','EXPENSE','DEBIT','API','5100',2,true,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5200','Operating Expenses','EXPENSE','DEBIT','OPEX','5000',1,false,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5210','Salaries & Wages','EXPENSE','DEBIT','SALARY','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5211','Employee Salaries','EXPENSE','DEBIT','SALARY','5210',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5212','Employer PF / ESI','EXPENSE','DEBIT','SALARY','5210',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5213','Employee Benefits','EXPENSE','DEBIT','BENEFITS','5210',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5220','Rent & Occupancy','EXPENSE','DEBIT','RENT','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5230','Marketing & Advertising','EXPENSE','DEBIT','MARKETING','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5240','Technology & Software','EXPENSE','DEBIT','TECH','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5250','Professional Fees','EXPENSE','DEBIT','PROFESSIONAL','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5251','Legal Fees','EXPENSE','DEBIT','LEGAL','5250',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5252','Audit & Accounting Fees','EXPENSE','DEBIT','AUDIT','5250',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5260','Travel & Entertainment','EXPENSE','DEBIT','TRAVEL','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5270','Office & Administration','EXPENSE','DEBIT','ADMIN','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5280','Insurance','EXPENSE','DEBIT','INSURANCE','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5290','Depreciation & Amortization','EXPENSE','DEBIT','DEPRECIATION','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5291','Depreciation - PPE','EXPENSE','DEBIT','DEPRECIATION','5290',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5292','Amortization - Intangibles','EXPENSE','DEBIT','AMORTIZATION','5290',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5293','ROU Asset Amortization','EXPENSE','DEBIT','ROU_AMORT','5290',3,true,'income_stmt.opex','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5300','Finance Costs','EXPENSE','DEBIT','FINANCE','5000',1,false,'income_stmt.finance');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5310','Interest Expense','EXPENSE','DEBIT','INTEREST','5300',2,true,'income_stmt.finance');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5311','Bank Charges','EXPENSE','DEBIT','BANK_CHG','5300',2,true,'income_stmt.finance');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5320','Foreign Exchange Loss','EXPENSE','DEBIT','FX_LOSS','5300',2,true,'income_stmt.finance');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5330','Lease Interest Expense','EXPENSE','DEBIT','LEASE_INT','5300',2,true,'income_stmt.finance','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5400','Tax Expense','EXPENSE','DEBIT','TAX','5000',1,false,'income_stmt.tax');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5410','Current Income Tax Expense','EXPENSE','DEBIT','TAX','5400',2,true,'income_stmt.tax');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5420','Deferred Tax Expense','EXPENSE','DEBIT','DEFERRED_TAX','5400',2,true,'income_stmt.tax');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5430','GST Expense (Non-recoverable)','EXPENSE','DEBIT','GST','5400',2,true,'income_stmt.tax');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5500','Other Expenses','EXPENSE','DEBIT','OTHER','5000',1,false,'income_stmt.other');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5510','Write-offs & Impairments','EXPENSE','DEBIT','WRITEOFF','5500',2,true,'income_stmt.other');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5520','Bad Debt Expense','EXPENSE','DEBIT','BAD_DEBT','5500',2,true,'income_stmt.other');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5530','Miscellaneous Expense','EXPENSE','DEBIT','MISC','5500',2,true,'income_stmt.other');

  RETURN 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_default_chart_of_accounts TO authenticated;
`;

fs.writeFileSync(path.join(migrationsDir, '20260824100002_finance_phase1_seed_coa.sql'), fixedSeedCoa);

let phase2 = fs.readFileSync(path.join(migrationsDir, '20260824200001_finance_phase2_subledgers.sql'), 'utf-8');
let phase3 = fs.readFileSync(path.join(migrationsDir, '20260824300001_finance_phase3_revenue_contracts.sql'), 'utf-8');
let phase4 = fs.readFileSync(path.join(migrationsDir, '20260824400001_finance_phase4_banking_reconciliation.sql'), 'utf-8');
let phase5 = fs.readFileSync(path.join(migrationsDir, '20260824500001_finance_phase5_close_intelligence.sql'), 'utf-8');

const POSTSCRIPT = `
-- ============================================================
-- AUTO-PROVISIONING: TalentXcel Services Private Limited
-- ============================================================

DO $$
DECLARE
  v_sys_org_id UUID;
  v_fin_org_id UUID;
  v_entity_id  UUID;
  v_period_id  UUID;
BEGIN
  -- 1. Ensure sys_organization
  SELECT id INTO v_sys_org_id FROM public.sys_organizations LIMIT 1;
  IF v_sys_org_id IS NULL THEN
    INSERT INTO public.sys_organizations (id, name, slug)
    VALUES ('00000000-0000-0000-0000-000000000001', 'TalentXcel Services Private Limited', 'talentxcel')
    RETURNING id INTO v_sys_org_id;
  END IF;

  -- 2. Ensure fin_organizations
  SELECT id INTO v_fin_org_id FROM public.fin_organizations WHERE sys_organization_id = v_sys_org_id LIMIT 1;
  IF v_fin_org_id IS NULL THEN
    INSERT INTO public.fin_organizations (
      sys_organization_id, legal_name, base_currency, reporting_currency, accounting_standard
    )
    VALUES (
      v_sys_org_id, 'TalentXcel Services Private Limited', 'INR', 'INR', 'IFRS'
    )
    RETURNING id INTO v_fin_org_id;
  END IF;

  -- 3. Ensure legal entity
  SELECT id INTO v_entity_id FROM public.fin_legal_entities WHERE fin_organization_id = v_fin_org_id LIMIT 1;
  IF v_entity_id IS NULL THEN
    INSERT INTO public.fin_legal_entities (
      fin_organization_id, legal_name, entity_code, jurisdiction, functional_currency, accounting_standard, is_consolidating
    )
    VALUES (
      v_fin_org_id, 'TalentXcel Services Pvt Ltd (HQ India)', 'TXCEL-HQ', 'IN', 'INR', 'IFRS', true
    )
    RETURNING id INTO v_entity_id;
  END IF;

  -- 4. Ensure open period (August 2026 / Current)
  SELECT id INTO v_period_id FROM public.fin_periods WHERE fin_organization_id = v_fin_org_id AND status = 'OPEN' LIMIT 1;
  IF v_period_id IS NULL THEN
    INSERT INTO public.fin_periods (
      fin_organization_id, legal_entity_id, period_name, period_type, start_date, end_date, status
    )
    VALUES (
      v_fin_org_id, v_entity_id, 'August 2026 (FY26-Q2)', 'MONTH', '2026-08-01', '2026-08-31', 'OPEN'
    )
    RETURNING id INTO v_period_id;
  END IF;

  -- 5. Seed default Chart of Accounts for this org
  PERFORM public.seed_default_chart_of_accounts(v_fin_org_id);

END $$;
`;

const combined = [
  PREAMBLE,
  phase1,
  fixedSeedCoa,
  phase2,
  phase3,
  phase4,
  phase5,
  POSTSCRIPT
].join('\n\n');

fs.writeFileSync(path.join(migrationsDir, 'COMBINED_FINANCE_OS_SETUP.sql'), combined);

console.log('Successfully generated clean COMBINED_FINANCE_OS_SETUP.sql (' + combined.length + ' bytes)');
