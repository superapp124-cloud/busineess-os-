-- ============================================================
-- CHATR Financial Intelligence & Accounting Core
-- Phase 1: Default Chart of Accounts Seed
-- 20260824100002_finance_phase1_seed_coa.sql
-- Standard accounts for IFRS + US GAAP, INR base, India fiscal
-- ============================================================

-- Idempotent seed function: call after creating fin_organization + fin_legal_entity
CREATE OR REPLACE FUNCTION public.seed_default_chart_of_accounts(p_fin_org_id UUID)
RETURNS INTEGER LANGUAGE plpgsql AS $fn$
DECLARE
  v_inserted INTEGER := 0;
  v_le_id    UUID := NULL; -- NULL = shared across all entities

  PROCEDURE insert_account(
    p_code TEXT, p_name TEXT, p_type TEXT, p_normal TEXT,
    p_subtype TEXT DEFAULT NULL, p_parent TEXT DEFAULT NULL,
    p_depth INTEGER DEFAULT 0, p_allow_post BOOLEAN DEFAULT true,
    p_fs TEXT DEFAULT NULL, p_std TEXT DEFAULT 'BOTH'
  ) AS $proc$
  DECLARE v_parent_id UUID := NULL;
  BEGIN
    IF p_parent IS NOT NULL THEN
      SELECT id INTO v_parent_id FROM public.fin_accounts
      WHERE fin_organization_id=p_fin_org_id AND legal_entity_id IS NULL AND code=p_parent LIMIT 1;
    END IF;
    INSERT INTO public.fin_accounts(fin_organization_id,legal_entity_id,code,name,account_type,account_subtype,normal_balance,parent_account_id,depth,accounting_standard,allow_direct_posting,is_system_account,fs_mapping)
    VALUES (p_fin_org_id,v_le_id,p_code,p_name,p_type,p_subtype,p_normal,v_parent_id,p_depth,p_std,p_allow_post,true,p_fs)
    ON CONFLICT (fin_organization_id, legal_entity_id, code) DO NOTHING;
    v_inserted := v_inserted + 1;
  END; $proc$;

BEGIN
  -- ============ ASSETS (1xxx) ============
  CALL insert_account('1000','Assets','ASSET','DEBIT','ROOT',NULL,0,false,'balance_sheet.assets');
  CALL insert_account('1100','Current Assets','ASSET','DEBIT','CURRENT_ASSET','1000',1,false,'balance_sheet.current_assets');
  CALL insert_account('1110','Cash and Cash Equivalents','ASSET','DEBIT','CASH','1100',2,true,'balance_sheet.cash');
  CALL insert_account('1111','Petty Cash','ASSET','DEBIT','CASH','1110',3,true,'balance_sheet.cash');
  CALL insert_account('1112','Bank Accounts','ASSET','DEBIT','BANK','1110',3,false,'balance_sheet.cash');
  CALL insert_account('1113','Current Account - Primary','ASSET','DEBIT','BANK','1112',4,true,'balance_sheet.cash');
  CALL insert_account('1114','Savings Account','ASSET','DEBIT','BANK','1112',4,true,'balance_sheet.cash');
  CALL insert_account('1120','Accounts Receivable','ASSET','DEBIT','RECEIVABLE','1100',2,true,'balance_sheet.receivables');
  CALL insert_account('1121','Trade Receivables','ASSET','DEBIT','RECEIVABLE','1120',3,true,'balance_sheet.receivables');
  CALL insert_account('1122','GST Input Tax Credit','ASSET','DEBIT','TAX','1100',2,true,'balance_sheet.other_current');
  CALL insert_account('1130','Prepaid Expenses','ASSET','DEBIT','PREPAID','1100',2,true,'balance_sheet.other_current');
  CALL insert_account('1131','Prepaid Rent','ASSET','DEBIT','PREPAID','1130',3,true,'balance_sheet.other_current');
  CALL insert_account('1132','Prepaid Insurance','ASSET','DEBIT','PREPAID','1130',3,true,'balance_sheet.other_current');
  CALL insert_account('1140','Short-term Investments','ASSET','DEBIT','INVESTMENT','1100',2,true,'balance_sheet.other_current');
  CALL insert_account('1150','Inventory','ASSET','DEBIT','INVENTORY','1100',2,true,'balance_sheet.inventory');
  CALL insert_account('1160','Other Current Assets','ASSET','DEBIT','OTHER','1100',2,true,'balance_sheet.other_current');
  CALL insert_account('1200','Non-Current Assets','ASSET','DEBIT','NONCURRENT_ASSET','1000',1,false,'balance_sheet.noncurrent_assets');
  CALL insert_account('1210','Property, Plant & Equipment (Gross)','ASSET','DEBIT','FIXED_ASSET','1200',2,false,'balance_sheet.ppe');
  CALL insert_account('1211','Land','ASSET','DEBIT','LAND','1210',3,true,'balance_sheet.ppe');
  CALL insert_account('1212','Buildings','ASSET','DEBIT','BUILDING','1210',3,true,'balance_sheet.ppe');
  CALL insert_account('1213','Computer Equipment','ASSET','DEBIT','EQUIPMENT','1210',3,true,'balance_sheet.ppe');
  CALL insert_account('1214','Office Furniture','ASSET','DEBIT','EQUIPMENT','1210',3,true,'balance_sheet.ppe');
  CALL insert_account('1215','Leasehold Improvements','ASSET','DEBIT','LEASEHOLD','1210',3,true,'balance_sheet.ppe');
  CALL insert_account('1220','Accumulated Depreciation','CONTRA_ASSET','CREDIT','ACC_DEP','1200',2,false,'balance_sheet.ppe');
  CALL insert_account('1221','Accum. Dep - Buildings','CONTRA_ASSET','CREDIT','ACC_DEP','1220',3,true,'balance_sheet.ppe');
  CALL insert_account('1222','Accum. Dep - Computer Equipment','CONTRA_ASSET','CREDIT','ACC_DEP','1220',3,true,'balance_sheet.ppe');
  CALL insert_account('1223','Accum. Dep - Office Furniture','CONTRA_ASSET','CREDIT','ACC_DEP','1220',3,true,'balance_sheet.ppe');
  CALL insert_account('1230','Right-of-Use Assets','ASSET','DEBIT','ROU_ASSET','1200',2,true,'balance_sheet.rou','IFRS');
  CALL insert_account('1240','Intangible Assets','ASSET','DEBIT','INTANGIBLE','1200',2,true,'balance_sheet.intangibles');
  CALL insert_account('1241','Software Licenses','ASSET','DEBIT','SOFTWARE','1240',3,true,'balance_sheet.intangibles');
  CALL insert_account('1242','Patents & IP','ASSET','DEBIT','IP','1240',3,true,'balance_sheet.intangibles');
  CALL insert_account('1250','Long-term Investments','ASSET','DEBIT','INVESTMENT','1200',2,true,'balance_sheet.investments');
  CALL insert_account('1260','Goodwill','ASSET','DEBIT','GOODWILL','1200',2,true,'balance_sheet.intangibles');
  CALL insert_account('1270','Deferred Tax Asset','ASSET','DEBIT','DEFERRED_TAX','1200',2,true,'balance_sheet.other_noncurrent');
  CALL insert_account('1280','Other Non-Current Assets','ASSET','DEBIT','OTHER','1200',2,true,'balance_sheet.other_noncurrent');

  -- ============ LIABILITIES (2xxx) ============
  CALL insert_account('2000','Liabilities','LIABILITY','CREDIT','ROOT',NULL,0,false,'balance_sheet.liabilities');
  CALL insert_account('2100','Current Liabilities','LIABILITY','CREDIT','CURRENT_LIABILITY','2000',1,false,'balance_sheet.current_liabilities');
  CALL insert_account('2110','Accounts Payable','LIABILITY','CREDIT','PAYABLE','2100',2,true,'balance_sheet.payables');
  CALL insert_account('2111','Trade Payables','LIABILITY','CREDIT','PAYABLE','2110',3,true,'balance_sheet.payables');
  CALL insert_account('2120','Accrued Liabilities','LIABILITY','CREDIT','ACCRUAL','2100',2,true,'balance_sheet.accrued');
  CALL insert_account('2121','Accrued Salaries','LIABILITY','CREDIT','ACCRUAL','2120',3,true,'balance_sheet.accrued');
  CALL insert_account('2122','Accrued Expenses','LIABILITY','CREDIT','ACCRUAL','2120',3,true,'balance_sheet.accrued');
  CALL insert_account('2123','Accrued Interest','LIABILITY','CREDIT','ACCRUAL','2120',3,true,'balance_sheet.accrued');
  CALL insert_account('2130','Deferred Revenue','LIABILITY','CREDIT','DEFERRED_REV','2100',2,true,'balance_sheet.deferred_revenue');
  CALL insert_account('2131','Deferred Revenue - Subscriptions','LIABILITY','CREDIT','DEFERRED_REV','2130',3,true,'balance_sheet.deferred_revenue');
  CALL insert_account('2132','Deferred Revenue - Services','LIABILITY','CREDIT','DEFERRED_REV','2130',3,true,'balance_sheet.deferred_revenue');
  CALL insert_account('2140','Tax Payable','LIABILITY','CREDIT','TAX','2100',2,false,'balance_sheet.taxes');
  CALL insert_account('2141','GST Payable','LIABILITY','CREDIT','TAX','2140',3,true,'balance_sheet.taxes');
  CALL insert_account('2142','TDS Payable','LIABILITY','CREDIT','TAX','2140',3,true,'balance_sheet.taxes');
  CALL insert_account('2143','Income Tax Payable','LIABILITY','CREDIT','TAX','2140',3,true,'balance_sheet.taxes');
  CALL insert_account('2150','Short-term Loans','LIABILITY','CREDIT','LOAN','2100',2,true,'balance_sheet.short_term_debt');
  CALL insert_account('2160','Customer Advances','LIABILITY','CREDIT','ADVANCE','2100',2,true,'balance_sheet.other_current');
  CALL insert_account('2170','Other Current Liabilities','LIABILITY','CREDIT','OTHER','2100',2,true,'balance_sheet.other_current');
  CALL insert_account('2200','Non-Current Liabilities','LIABILITY','CREDIT','NONCURRENT_LIABILITY','2000',1,false,'balance_sheet.noncurrent_liabilities');
  CALL insert_account('2210','Long-term Loans','LIABILITY','CREDIT','LOAN','2200',2,true,'balance_sheet.long_term_debt');
  CALL insert_account('2220','Lease Liabilities','LIABILITY','CREDIT','LEASE','2200',2,true,'balance_sheet.lease_liabilities','IFRS');
  CALL insert_account('2230','Deferred Tax Liability','LIABILITY','CREDIT','DEFERRED_TAX','2200',2,true,'balance_sheet.other_noncurrent');
  CALL insert_account('2240','Other Non-Current Liabilities','LIABILITY','CREDIT','OTHER','2200',2,true,'balance_sheet.other_noncurrent');

  -- ============ EQUITY (3xxx) ============
  CALL insert_account('3000','Equity','EQUITY','CREDIT','ROOT',NULL,0,false,'balance_sheet.equity');
  CALL insert_account('3100','Share Capital','EQUITY','CREDIT','SHARE_CAPITAL','3000',1,true,'balance_sheet.share_capital');
  CALL insert_account('3110','Ordinary Share Capital','EQUITY','CREDIT','SHARE_CAPITAL','3100',2,true,'balance_sheet.share_capital');
  CALL insert_account('3120','Preference Share Capital','EQUITY','CREDIT','SHARE_CAPITAL','3100',2,true,'balance_sheet.share_capital');
  CALL insert_account('3130','Share Premium','EQUITY','CREDIT','SHARE_PREMIUM','3000',1,true,'balance_sheet.share_premium');
  CALL insert_account('3200','Retained Earnings','EQUITY','CREDIT','RETAINED_EARNINGS','3000',1,true,'balance_sheet.retained_earnings');
  CALL insert_account('3210','Current Year Profit/Loss','EQUITY','CREDIT','CURRENT_YEAR_PL','3200',2,true,'balance_sheet.current_pl');
  CALL insert_account('3300','Other Comprehensive Income','EQUITY','CREDIT','OCI','3000',1,false,'balance_sheet.oci','IFRS');
  CALL insert_account('3310','OCI - FX Translation Reserve','EQUITY','CREDIT','OCI_FX','3300',2,true,'balance_sheet.oci','IFRS');
  CALL insert_account('3320','OCI - Revaluation Reserve','EQUITY','CREDIT','OCI_REVAL','3300',2,true,'balance_sheet.oci','IFRS');

  -- ============ REVENUE (4xxx) ============
  CALL insert_account('4000','Revenue','REVENUE','CREDIT','ROOT',NULL,0,false,'income_stmt.revenue');
  CALL insert_account('4100','Operating Revenue','REVENUE','CREDIT','OPERATING','4000',1,false,'income_stmt.revenue');
  CALL insert_account('4110','Product Revenue','REVENUE','CREDIT','PRODUCT','4100',2,true,'income_stmt.revenue');
  CALL insert_account('4120','Service Revenue','REVENUE','CREDIT','SERVICE','4100',2,true,'income_stmt.revenue');
  CALL insert_account('4130','Subscription Revenue','REVENUE','CREDIT','SUBSCRIPTION','4100',2,true,'income_stmt.revenue');
  CALL insert_account('4140','SaaS Revenue','REVENUE','CREDIT','SAAS','4130',3,true,'income_stmt.revenue');
  CALL insert_account('4150','Professional Services Revenue','REVENUE','CREDIT','SERVICES','4100',2,true,'income_stmt.revenue');
  CALL insert_account('4160','Consulting Revenue','REVENUE','CREDIT','CONSULTING','4150',3,true,'income_stmt.revenue');
  CALL insert_account('4200','Other Income','REVENUE','CREDIT','OTHER_INCOME','4000',1,false,'income_stmt.other_income');
  CALL insert_account('4210','Interest Income','REVENUE','CREDIT','INTEREST','4200',2,true,'income_stmt.other_income');
  CALL insert_account('4220','Foreign Exchange Gain','REVENUE','CREDIT','FX_GAIN','4200',2,true,'income_stmt.other_income');
  CALL insert_account('4230','Other Income','REVENUE','CREDIT','OTHER','4200',2,true,'income_stmt.other_income');
  CALL insert_account('4300','Contract Revenue (ASC 606 / IFRS 15)','REVENUE','CREDIT','CONTRACT','4000',1,false,'income_stmt.revenue');
  CALL insert_account('4310','Revenue - Point-in-Time','REVENUE','CREDIT','POT','4300',2,true,'income_stmt.revenue');
  CALL insert_account('4320','Revenue - Over Time (Straight-line)','REVENUE','CREDIT','OT_SL','4300',2,true,'income_stmt.revenue');
  CALL insert_account('4330','Revenue - Over Time (Milestone)','REVENUE','CREDIT','OT_MS','4300',2,true,'income_stmt.revenue');

  -- ============ EXPENSES (5xxx) ============
  CALL insert_account('5000','Expenses','EXPENSE','DEBIT','ROOT',NULL,0,false,'income_stmt.expenses');
  CALL insert_account('5100','Cost of Revenue','EXPENSE','DEBIT','COGS','5000',1,false,'income_stmt.cogs');
  CALL insert_account('5110','Cost of Goods Sold','EXPENSE','DEBIT','COGS','5100',2,true,'income_stmt.cogs');
  CALL insert_account('5120','Cost of Services','EXPENSE','DEBIT','COS','5100',2,true,'income_stmt.cogs');
  CALL insert_account('5130','Hosting & Infrastructure','EXPENSE','DEBIT','INFRA','5100',2,true,'income_stmt.cogs');
  CALL insert_account('5140','Third-party API Costs','EXPENSE','DEBIT','API','5100',2,true,'income_stmt.cogs');
  CALL insert_account('5200','Operating Expenses','EXPENSE','DEBIT','OPEX','5000',1,false,'income_stmt.opex');
  CALL insert_account('5210','Salaries & Wages','EXPENSE','DEBIT','SALARY','5200',2,true,'income_stmt.opex');
  CALL insert_account('5211','Employee Salaries','EXPENSE','DEBIT','SALARY','5210',3,true,'income_stmt.opex');
  CALL insert_account('5212','Employer PF / ESI','EXPENSE','DEBIT','SALARY','5210',3,true,'income_stmt.opex');
  CALL insert_account('5213','Employee Benefits','EXPENSE','DEBIT','BENEFITS','5210',3,true,'income_stmt.opex');
  CALL insert_account('5220','Rent & Occupancy','EXPENSE','DEBIT','RENT','5200',2,true,'income_stmt.opex');
  CALL insert_account('5230','Marketing & Advertising','EXPENSE','DEBIT','MARKETING','5200',2,true,'income_stmt.opex');
  CALL insert_account('5240','Technology & Software','EXPENSE','DEBIT','TECH','5200',2,true,'income_stmt.opex');
  CALL insert_account('5250','Professional Fees','EXPENSE','DEBIT','PROFESSIONAL','5200',2,true,'income_stmt.opex');
  CALL insert_account('5251','Legal Fees','EXPENSE','DEBIT','LEGAL','5250',3,true,'income_stmt.opex');
  CALL insert_account('5252','Audit & Accounting Fees','EXPENSE','DEBIT','AUDIT','5250',3,true,'income_stmt.opex');
  CALL insert_account('5260','Travel & Entertainment','EXPENSE','DEBIT','TRAVEL','5200',2,true,'income_stmt.opex');
  CALL insert_account('5270','Office & Administration','EXPENSE','DEBIT','ADMIN','5200',2,true,'income_stmt.opex');
  CALL insert_account('5280','Insurance','EXPENSE','DEBIT','INSURANCE','5200',2,true,'income_stmt.opex');
  CALL insert_account('5290','Depreciation & Amortization','EXPENSE','DEBIT','DEPRECIATION','5200',2,true,'income_stmt.opex');
  CALL insert_account('5291','Depreciation - PPE','EXPENSE','DEBIT','DEPRECIATION','5290',3,true,'income_stmt.opex');
  CALL insert_account('5292','Amortization - Intangibles','EXPENSE','DEBIT','AMORTIZATION','5290',3,true,'income_stmt.opex');
  CALL insert_account('5293','ROU Asset Amortization','EXPENSE','DEBIT','ROU_AMORT','5290',3,true,'income_stmt.opex','IFRS');
  CALL insert_account('5300','Finance Costs','EXPENSE','DEBIT','FINANCE','5000',1,false,'income_stmt.finance');
  CALL insert_account('5310','Interest Expense','EXPENSE','DEBIT','INTEREST','5300',2,true,'income_stmt.finance');
  CALL insert_account('5311','Bank Charges','EXPENSE','DEBIT','BANK_CHG','5300',2,true,'income_stmt.finance');
  CALL insert_account('5320','Foreign Exchange Loss','EXPENSE','DEBIT','FX_LOSS','5300',2,true,'income_stmt.finance');
  CALL insert_account('5330','Lease Interest Expense','EXPENSE','DEBIT','LEASE_INT','5300',2,true,'income_stmt.finance','IFRS');
  CALL insert_account('5400','Tax Expense','EXPENSE','DEBIT','TAX','5000',1,false,'income_stmt.tax');
  CALL insert_account('5410','Current Income Tax Expense','EXPENSE','DEBIT','TAX','5400',2,true,'income_stmt.tax');
  CALL insert_account('5420','Deferred Tax Expense','EXPENSE','DEBIT','DEFERRED_TAX','5400',2,true,'income_stmt.tax');
  CALL insert_account('5430','GST Expense (Non-recoverable)','EXPENSE','DEBIT','GST','5400',2,true,'income_stmt.tax');
  CALL insert_account('5500','Other Expenses','EXPENSE','DEBIT','OTHER','5000',1,false,'income_stmt.other');
  CALL insert_account('5510','Write-offs & Impairments','EXPENSE','DEBIT','WRITEOFF','5500',2,true,'income_stmt.other');
  CALL insert_account('5520','Bad Debt Expense','EXPENSE','DEBIT','BAD_DEBT','5500',2,true,'income_stmt.other');
  CALL insert_account('5530','Miscellaneous Expense','EXPENSE','DEBIT','MISC','5500',2,true,'income_stmt.other');

  RETURN v_inserted;
END; $fn$;

GRANT EXECUTE ON FUNCTION public.seed_default_chart_of_accounts TO authenticated;
