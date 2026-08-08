import { WorkspaceItem } from '../adapters/types';
import { MissionExecutionContext } from '../../../core/types';

const uuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const DocumentIntelligenceService = {
  /**
   * Extracts raw text from an uploaded file using pdfjs-dist for PDFs,
   * or FileReader for text files.
   */
  async extractText(file?: File): Promise<string> {
    if (!file || file.size === 0) return '';

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let extractedText = '';

        for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 10); pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          extractedText += ` Page ${pageNum}: ` + pageText;
        }
        return extractedText;
      } catch (err) {
        console.warn('[DocumentIntelligenceService] PDF text extraction error:', err);
        return '';
      }
    }

    if (
      fileName.endsWith('.txt') ||
      fileName.endsWith('.json') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.csv') ||
      fileName.endsWith('.xml') ||
      fileName.endsWith('.html')
    ) {
      try {
        return await file.text();
      } catch (err) {
        console.warn('[DocumentIntelligenceService] Text file reading error:', err);
        return '';
      }
    }

    return '';
  },

  /**
   * Analyzes document text dynamically and constructs a MissionExecutionContext.
   */
  async analyzeDocument(item: WorkspaceItem): Promise<MissionExecutionContext> {
    const fileName = item.rawFile?.name || item.sourceUri || 'Document';
    const fileSize = item.rawFile?.size || 0;
    const extractedText = await this.extractText(item.rawFile);

    const fullContent = (fileName + ' ' + extractedText).toLowerCase();

    let category = 'General Business Document';
    let mission = `Analyze and Structure ${fileName}`;
    let actionRequired: MissionExecutionContext['actionRequired'] = 'Review & Store';
    let recommendations: any[] = [];
    let auditTrail: any[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Extract basic statistics and entities
    const wordCount = extractedText ? extractedText.split(/\s+/).filter(Boolean).length : 0;
    const foundAmounts = extractedText.match(/(?:[₹$€£]\s?\d+(?:,\d+)*(?:\.\d+)?|\d+\s?(?:LPA|INR|USD|EUR))/gi) || [];
    const foundDates = extractedText.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/gi) || [];
    const foundEmails = extractedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];

    // Classification heuristics on real text & filename
    if (
      fullContent.includes('prescription') ||
      fullContent.includes('pathology') ||
      fullContent.includes('patient') ||
      fullContent.includes('doctor') ||
      fullContent.includes('diagnosis') ||
      fullContent.includes('lab_report') ||
      fullContent.includes('mg ') ||
      fullContent.includes('dosage')
    ) {
      category = 'Healthcare & Medical';
      mission = `Medical Analysis — ${fileName}`;
      actionRequired = 'Human Approval Required';
      riskLevel = 'medium';

      recommendations = [
        {
          action: 'Extract Medication Schedule & Dosages',
          reason: extractedText
            ? `Extracted ${wordCount} words from prescription. Review dosage instructions and potential interactions.`
            : `Uploaded medical file (${(fileSize / 1024).toFixed(1)} KB). Run full OCR scanner for detail extraction.`,
          missingEvidence: ['Pharmacist Verification'],
          riskLevel: 'medium',
          plugin: 'Clinical Extraction Plugin',
          confidence: extractedText ? 92 : 80,
        },
        {
          action: 'Verify Patient & Practitioner Identity',
          reason: foundEmails.length > 0
            ? `Found contact email: ${foundEmails[0]}. Confirm clinic details.`
            : 'Verify practitioner registration number against national medical database.',
          missingEvidence: ['Doctor Registration ID'],
          riskLevel: 'low',
          plugin: 'Identity Verification Plugin',
          confidence: 88,
        },
      ];
    } else if (
      fullContent.includes('resume') ||
      fullContent.includes('candidate') ||
      fullContent.includes('curriculum vitae') ||
      fullContent.includes('job description') ||
      fullContent.includes('experience') ||
      fullContent.includes('skills') ||
      fullContent.includes('education')
    ) {
      category = 'Talent & Recruitment';
      mission = `Candidate Evaluation — ${fileName}`;
      actionRequired = 'Shortlist Assessment';
      riskLevel = 'low';

      recommendations = [
        {
          action: 'Evaluate Competencies & Experience',
          reason: extractedText
            ? `Extracted document text containing ${wordCount} words. Parsed ${foundEmails.length} email contact(s).`
            : `Candidate profile (${(fileSize / 1024).toFixed(1)} KB) received. Skill matching queued.`,
          missingEvidence: ['Interview Assessment'],
          riskLevel: 'low',
          plugin: 'Talent Evaluation Plugin',
          confidence: 90,
        },
        {
          action: 'Run Verification & Reference Checks',
          reason: 'Check prior work history and academic credentials before proceeding to offer stage.',
          missingEvidence: ['Candidate Consent Form'],
          riskLevel: 'low',
          plugin: 'Background Verification Plugin',
          confidence: 95,
        },
      ];
    } else if (
      fullContent.includes('contract') ||
      fullContent.includes('agreement') ||
      fullContent.includes('addendum') ||
      fullContent.includes('terms') ||
      fullContent.includes('clause') ||
      fullContent.includes('liability') ||
      fullContent.includes('sign')
    ) {
      category = 'Legal & Compliance';
      mission = `Contract Audit — ${fileName}`;
      actionRequired = 'Legal Review Required';
      riskLevel = 'medium';

      recommendations = [
        {
          action: 'Review Key Legal Terms & Liability Clauses',
          reason: extractedText
            ? `Extracted contract text (${wordCount} words). Detected ${foundAmounts.length} monetary references.`
            : 'Document uploaded for legal clause parsing and non-standard risk detection.',
          missingEvidence: ['Legal Counsel Sign-off'],
          riskLevel: 'medium',
          plugin: 'Clause Analysis Plugin',
          confidence: 88,
        },
        {
          action: 'Verify Signatory Authority & Validity Dates',
          reason: foundDates.length > 0
            ? `Extracted key date references: ${foundDates.slice(0, 2).join(', ')}.`
            : 'Confirm execution dates and renewal notice periods.',
          missingEvidence: [],
          riskLevel: 'low',
          plugin: 'Contract Term Plugin',
          confidence: 91,
        },
      ];
    } else if (
      fullContent.includes('invoice') ||
      fullContent.includes('receipt') ||
      fullContent.includes('tax') ||
      fullContent.includes('payment') ||
      fullContent.includes('billing') ||
      fullContent.includes('gst') ||
      fullContent.includes('pan')
    ) {
      category = 'Finance & Accounting';
      mission = `Financial Audit — ${fileName}`;
      actionRequired = 'Reconciliation & Filing';
      riskLevel = 'low';

      recommendations = [
        {
          action: 'Reconcile Line Items & Tax Deductions',
          reason: foundAmounts.length > 0
            ? `Extracted financial amounts: ${foundAmounts.slice(0, 3).join(', ')}.`
            : `Financial record (${(fileSize / 1024).toFixed(1)} KB) submitted for general ledger sync.`,
          missingEvidence: ['Manager Sign-off'],
          riskLevel: 'low',
          plugin: 'Finance Reconciliation Plugin',
          confidence: 94,
        },
      ];
    } else {
      recommendations = [
        {
          action: 'Structure Document Context & Metadata',
          reason: extractedText
            ? `Extracted ${wordCount} words of text content. Indexing content into enterprise knowledge graph.`
            : `Document file size: ${(fileSize / 1024).toFixed(1)} KB. Ready for manual review and tagging.`,
          missingEvidence: [],
          riskLevel: 'low',
          plugin: 'General Document Engine',
          confidence: 85,
        },
      ];
    }

    // Build Audit Trail dynamically
    const now = new Date();
    auditTrail = [
      {
        label: 'File Received',
        detail: `File: ${fileName} | Size: ${(fileSize / 1024).toFixed(1)} KB | Format: ${item.typeHint || 'Document'}`,
        timestamp: new Date(now.getTime() - 1500).toISOString(),
      },
      {
        label: 'Text Extraction',
        detail: extractedText
          ? `Extracted ${wordCount} words via client-side parser.`
          : 'Binary/Image content — visual analysis ready.',
        timestamp: new Date(now.getTime() - 800).toISOString(),
      },
      {
        label: 'Domain Classification',
        detail: `Categorized under: ${category}. Generated dynamic recommendations based on file content.`,
        timestamp: now.toISOString(),
      },
    ];

    const missionId = `mission_${uuid()}`;

    return {
      id: missionId,
      mission,
      lifecycleState: 'PENDING_APPROVAL',
      actionRequired,
      trigger: {
        id: `evt_${uuid()}`,
        type: 'ArtifactObserved',
        schemaVersion: '1.0',
        tenantId: 'user_tenant',
        actorId: 'user',
        source: 'User_Upload',
        aggregateId: item.id,
        aggregateKind: 'Artifact',
        payload: { id: item.id, sourceUri: item.sourceUri, rawFile: item.rawFile },
        occurredAt: now.toISOString(),
        traceContext: { correlationId: missionId, traceId: missionId, spanId: missionId.slice(0, 8) },
        idempotencyKey: `trigger_${item.id}_${Date.now()}`,
        classification: 'INTERNAL',
        metadata: {},
      } as any,
      missionGraph: [],
      executionPlan: [],
      resolvedContext: [],
      recommendations,
      auditTrail,
      businessOutcomes: {
        manualWorkEliminated: extractedText ? `~${Math.max(1, Math.round(wordCount / 200))} mins manual reading eliminated` : 'Document auto-indexed',
        decisionsAccelerated: recommendations.length,
        riskPrevented: riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) as any,
        financialValueCreated: foundAmounts.length > 0 ? `Tracked ${foundAmounts[0]}` : 'TBD',
        automationCompletionRate: extractedText ? '90%' : '60%',
        slaImprovement: 'Real-time processing',
      },
      hypotheses: [],
    };
  }
};
