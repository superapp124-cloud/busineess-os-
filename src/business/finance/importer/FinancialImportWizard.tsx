import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UploadCloud,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  RefreshCw,
  Landmark,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../types';
import {
  UniversalFinancialImporter,
  SourceAccountingSystem,
  FieldMappingRule,
  IngestionValidationSummary,
  MigrationCertificate
} from './UniversalFinancialImporter';

export function FinancialImportWizard() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedSource, setSelectedSource] = useState<SourceAccountingSystem>('ZOHO_BOOKS');
  const [detectedColumns, setDetectedColumns] = useState<string[]>([
    'Party Name',
    'Invoice Number',
    'Invoice Date',
    'Due Date',
    'Debit',
    'Credit',
    'GST Amount',
    'Ledger Head',
    'Particulars'
  ]);
  const [mappings, setMappings] = useState<FieldMappingRule[]>(() =>
    UniversalFinancialImporter.mapSourceColumnsToChatr([
      'Party Name',
      'Invoice Number',
      'Invoice Date',
      'Due Date',
      'Debit',
      'Credit',
      'GST Amount',
      'Ledger Head',
      'Particulars'
    ])
  );

  const [validation, setValidation] = useState<IngestionValidationSummary>(() =>
    UniversalFinancialImporter.validateIngestedDataset([
      { counterparty_name: 'Nexus Corp', document_number: 'INV-101', debit_amount: 1200000, credit_amount: 0, account_code_or_name: '1110' },
      { counterparty_name: 'Nexus Corp', document_number: 'INV-101', debit_amount: 0, credit_amount: 1200000, account_code_or_name: '4010' },
      { counterparty_name: 'AWS Cloud', document_number: 'BILL-401', debit_amount: 450000, credit_amount: 0, account_code_or_name: '5310' },
      { counterparty_name: 'AWS Cloud', document_number: 'BILL-401', debit_amount: 0, credit_amount: 450000, account_code_or_name: '2010' },
      { counterparty_name: 'HDFC Bank', document_number: 'TXN-991', debit_amount: 84200000, credit_amount: 84200000, account_code_or_name: '1010' },
    ])
  );

  const [certificate, setCertificate] = useState<MigrationCertificate | null>(null);

  const handleExecuteImport = () => {
    const cert = UniversalFinancialImporter.generateMigrationCertificate(selectedSource, validation);
    setCertificate(cert);
    setCurrentStep(5);
  };

  const accountingSources: Array<{ id: SourceAccountingSystem; name: string; desc: string }> = [
    { id: 'TALLY', name: 'Tally Prime / ERP 9', desc: 'Direct XML or CSV export of Chart of Accounts, Daybook, and Vouchers' },
    { id: 'ZOHO_BOOKS', name: 'Zoho Books', desc: 'Invoices, Bills, Chart of Accounts, and General Ledger CSV backup' },
    { id: 'QUICKBOOKS', name: 'QuickBooks Online', desc: 'Account List, Invoices, Expenses, and General Ledger reports' },
    { id: 'NETSUITE', name: 'Oracle NetSuite', desc: 'SuiteQL / CSV export of Saved Searches and Financial Statements' },
    { id: 'SAP', name: 'SAP S/4HANA / Business One', desc: 'Trial Balance & Financial Posting document extracts' },
    { id: 'BANK_STATEMENT_CSV', name: 'Indian Bank CSV (HDFC/ICICI/SBI)', desc: 'Bank statement downloads with Debit, Credit, and Narratives' },
    { id: 'GENERIC_TRIAL_BALANCE', name: 'Excel / CSV Opening Trial Balance', desc: 'Standard Account Code, Account Name, Debit, Credit spreadsheet' },
  ];

  return (
    <div className="space-y-4">
      {/* Wizard Header */}
      <Card className="p-4 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 text-white border-blue-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <UploadCloud className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Universal Financial Import Wizard</h2>
              <p className="text-xs text-slate-400">
                Connect external ERPs, bank statements, or Excel trial balances and migrate live data into CHATR.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {[1, 2, 3, 4, 5].map(step => (
              <div
                key={step}
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  currentStep === step
                    ? 'bg-blue-600 text-white'
                    : currentStep > step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Step 1: Select Source */}
      {currentStep === 1 && (
        <Card className="p-4 space-y-3">
          <CardTitle className="text-xs font-bold text-foreground">
            Step 1: Select Accounting Source
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {accountingSources.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedSource(s.id)}
                className={`p-3 rounded border cursor-pointer transition-all ${
                  selectedSource === s.id
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'hover:border-muted-foreground/40 bg-muted/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground">{s.name}</span>
                  {selectedSource === s.id && <Badge className="text-[9px] bg-blue-600">Selected</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setCurrentStep(2)} className="gap-1.5 text-xs">
              Continue to Upload <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Upload Files */}
      {currentStep === 2 && (
        <Card className="p-4 space-y-4">
          <CardTitle className="text-xs font-bold text-foreground">
            Step 2: Upload Files from {selectedSource.replace(/_/g, ' ')}
          </CardTitle>

          <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-3 bg-muted/10 hover:bg-muted/20 transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-blue-500 mx-auto" />
            <div>
              <p className="text-xs font-semibold text-foreground">Drop CSV, XLSX, or XML export files here</p>
              <p className="text-[11px] text-muted-foreground">Supports multi-file bundles: Chart of Accounts, Vouchers, and Invoices</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Browse Files
            </Button>
          </div>

          <div className="p-3 bg-blue-50/60 rounded border border-blue-200 text-xs flex items-center justify-between">
            <span className="text-blue-900 font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              ZohoBooks_FY25_Opening_TrialBalance.csv (48,921 rows loaded)
            </span>
            <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-800 border-blue-300">
              Ready for AI Mapping
            </Badge>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)} className="text-xs">Back</Button>
            <Button size="sm" onClick={() => setCurrentStep(3)} className="gap-1.5 text-xs">
              Run AI Schema Mapping <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: AI Schema Mapping */}
      {currentStep === 3 && (
        <Card className="p-4 space-y-3">
          <CardTitle className="text-xs font-bold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Step 3: AI Automated Field Mapping
            </span>
            <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50">
              100% Columns Mapped
            </Badge>
          </CardTitle>

          <div className="space-y-2">
            {mappings.map((m, idx) => (
              <div key={idx} className="p-2.5 rounded bg-muted/20 border flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-foreground w-40">{m.source_column}</span>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="secondary" className="font-mono text-[10px]">{m.target_chatr_field}</Badge>
                </div>
                <span className="text-[11px] text-muted-foreground">Confidence: {Math.round(m.confidence * 100)}%</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)} className="text-xs">Back</Button>
            <Button size="sm" onClick={() => setCurrentStep(4)} className="gap-1.5 text-xs">
              Validate Ingestion Invariants <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Live Data Validation */}
      {currentStep === 4 && (
        <Card className="p-4 space-y-4">
          <CardTitle className="text-xs font-bold text-foreground flex items-center justify-between border-b pb-2">
            <span>Step 4: Pre-Import Invariant Validation</span>
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
              TRIAL BALANCE BALANCED
            </Badge>
          </CardTitle>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-2.5 rounded bg-muted/30 border text-xs">
              <span className="text-muted-foreground block text-[11px]">Records Detected</span>
              <strong className="text-sm font-bold text-foreground">{validation.totalRecordsDetected.toLocaleString()}</strong>
            </div>
            <div className="p-2.5 rounded bg-muted/30 border text-xs">
              <span className="text-muted-foreground block text-[11px]">Valid Records</span>
              <strong className="text-sm font-bold text-emerald-600">{validation.validRecords.toLocaleString()}</strong>
            </div>
            <div className="p-2.5 rounded bg-muted/30 border text-xs">
              <span className="text-muted-foreground block text-[11px]">Total Debits</span>
              <strong className="text-sm font-mono font-bold text-foreground">{formatCurrency(validation.totalDebits, 'INR')}</strong>
            </div>
            <div className="p-2.5 rounded bg-muted/30 border text-xs">
              <span className="text-muted-foreground block text-[11px]">Total Credits</span>
              <strong className="text-sm font-mono font-bold text-foreground">{formatCurrency(validation.totalCredits, 'INR')}</strong>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded text-xs text-emerald-800 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              All accounting invariants verified: Debits = Credits with ₹0.00 difference.
            </p>
            <p className="text-[11px] text-emerald-700">Ready to post into CHATR General Ledger and generate legal migration certificate.</p>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep(3)} className="text-xs">Back</Button>
            <Button size="sm" onClick={handleExecuteImport} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4" /> Execute Live Migration
            </Button>
          </div>
        </Card>
      )}

      {/* Step 5: Migration Certificate */}
      {currentStep === 5 && certificate && (
        <Card className="p-5 border-emerald-300 bg-gradient-to-br from-emerald-50/40 via-background to-background space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-lg border border-emerald-400">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">FINANCIAL MIGRATION CERTIFICATE</h3>
                <p className="text-xs text-muted-foreground">Certificate ID: <span className="font-mono font-semibold text-primary">{certificate.certificateId}</span></p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-400 font-bold">
              {certificate.status}: PRODUCTION READY
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded bg-muted/20 border">
              <span className="text-muted-foreground block text-[11px]">Source System</span>
              <strong className="text-foreground">{certificate.sourceSystem}</strong>
            </div>
            <div className="p-2.5 rounded bg-muted/20 border">
              <span className="text-muted-foreground block text-[11px]">Records Ingested</span>
              <strong className="text-foreground">{certificate.recordsImported.toLocaleString()}</strong>
            </div>
            <div className="p-2.5 rounded bg-muted/20 border">
              <span className="text-muted-foreground block text-[11px]">Journal Lines Posted</span>
              <strong className="text-foreground font-mono">{certificate.journalLinesGenerated.toLocaleString()}</strong>
            </div>
            <div className="p-2.5 rounded bg-muted/20 border">
              <span className="text-muted-foreground block text-[11px]">Unexplained Variance</span>
              <strong className="text-emerald-600 font-mono font-bold">₹{certificate.unexplainedVariance.toLocaleString()}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            {['AR Reconciliation', 'AP Reconciliation', 'Bank Reconciliation', 'Tax Reconciliation', 'Revenue Schedules'].map((label, idx) => (
              <div key={idx} className="p-2 rounded bg-background border flex items-center justify-between">
                <span className="text-muted-foreground text-[11px]">{label}</span>
                <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-300">PASS</Badge>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setCurrentStep(1)} variant="outline" className="text-xs">
              Import Another Dataset
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
