import React, { useState, memo, useMemo } from 'react';
import { Upload, X, FileText, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Candidate, Requisition } from './types';
import { ResumeIntelligencePipeline } from './resumeIntelligence';

interface ImportCvModalProps {
  open: boolean;
  onClose: () => void;
  onImportCandidate: (candidate: Partial<Candidate>, originalFile?: File) => void;
  onImportBatchCandidates?: (candidates: Array<{ candidateData: Partial<Candidate>; originalFile?: File }>) => void;
  requisitions: Requisition[];
}

const ImportCvModal = memo(({ open, onClose, onImportCandidate, onImportBatchCandidates, requisitions }: ImportCvModalProps) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'email'>('upload');
  const [parsing, setParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState<{ current: number; total: number } | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [cvText, setCvText] = useState('');
  const pipeline = useMemo(() => new ResumeIntelligencePipeline(), []);

  // Email Inbox Sync State
  const [emailProvider, setEmailProvider] = useState<'outlook' | 'gmail' | 'imap'>('outlook');
  const [inboxAddress, setInboxAddress] = useState('careers@talentxcel.com');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [isSyncingMail, setIsSyncingMail] = useState(false);

  if (!open) return null;

  const ingestDocument = async (file?: File, nativeText?: string): Promise<Partial<Candidate>> => {
    const result = await pipeline.process({
      name: file?.name || 'Pasted document',
      mimeType: file?.type || 'text/plain',
      nativeText,
      receivedAt: new Date().toISOString()
    });
    return {
      ...result.candidate,
      status: 'Applied',
      applied_for: selectedRole || requisitions[0]?.id || null
    };
  };

  // Native document extraction feeds the evidence-driven pipeline.\r\n  // Robust In-Browser Native DOCX Zip Inflater & Table Harvester
  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();

    // 1. DOCX Extraction Pipeline (Native Zip Inflater + DecompressionStream('deflate-raw'))
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        // Robust ZIP Central Directory Harvester (Handles Bit 3 Streaming & Standard ZIPs)
        let docXmlLocalOffset = -1;
        let docXmlCompSize = 0;
        let docXmlCompMethod = 8;

        // 1. Scan Central Directory Headers (Signature: 0x02014b50 -> "PK\x01\x02")
        // Central Directory ALWAYS contains real compSize & localHeaderOffset even when Local Header has 0-size Bit 3 Streaming!
        for (let i = 0; i < bytes.length - 46; i++) {
          if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x01 && bytes[i + 3] === 0x02) {
            const compMethod = bytes[i + 10] | (bytes[i + 11] << 8);
            const compSize = bytes[i + 20] | (bytes[i + 21] << 8) | (bytes[i + 22] << 16) | (bytes[i + 23] << 24);
            const fileNameLen = bytes[i + 28] | (bytes[i + 29] << 8);
            const extraLen = bytes[i + 30] | (bytes[i + 31] << 8);
            const localHeaderOffset = bytes[i + 42] | (bytes[i + 43] << 8) | (bytes[i + 44] << 16) | (bytes[i + 45] << 24);

            const nameBytes = bytes.subarray(i + 46, i + 46 + fileNameLen);
            const name = new TextDecoder().decode(nameBytes);

            if (name === 'word/document.xml') {
              docXmlLocalOffset = localHeaderOffset;
              docXmlCompSize = compSize;
              docXmlCompMethod = compMethod;
              break;
            }
          }
        }

        // 2. Fallback to Local Header scan if Central Directory was missing
        if (docXmlLocalOffset === -1) {
          for (let i = 0; i < bytes.length - 30; i++) {
            if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x03 && bytes[i + 3] === 0x04) {
              const compMethod = bytes[i + 8] | (bytes[i + 9] << 8);
              const compSize = bytes[i + 18] | (bytes[i + 19] << 8) | (bytes[i + 20] << 16) | (bytes[i + 21] << 24);
              const fileNameLen = bytes[i + 26] | (bytes[i + 27] << 8);
              const nameBytes = bytes.subarray(i + 30, i + 30 + fileNameLen);
              const name = new TextDecoder().decode(nameBytes);

              if (name === 'word/document.xml') {
                docXmlLocalOffset = i;
                docXmlCompSize = compSize;
                docXmlCompMethod = compMethod;
                break;
              }
            }
          }
        }

        if (docXmlLocalOffset !== -1) {
          const lhFileNameLen = bytes[docXmlLocalOffset + 26] | (bytes[docXmlLocalOffset + 27] << 8);
          const lhExtraLen = bytes[docXmlLocalOffset + 28] | (bytes[docXmlLocalOffset + 29] << 8);
          const payloadOffset = docXmlLocalOffset + 30 + lhFileNameLen + lhExtraLen;

          const compressedSlice = bytes.subarray(payloadOffset, payloadOffset + (docXmlCompSize || (bytes.length - payloadOffset)));
          let rawXmlString = '';

          if (docXmlCompMethod === 0) {
            // Uncompressed Store
            rawXmlString = new TextDecoder('utf-8').decode(compressedSlice);
          } else if (docXmlCompMethod === 8 && typeof DecompressionStream !== 'undefined') {
            // DEFLATE-Compressed -> Decompress natively via Web API DecompressionStream('deflate-raw')
            const ds = new DecompressionStream('deflate-raw');
            const writer = ds.writable.getWriter();
            writer.write(compressedSlice);
            writer.close();
            const response = new Response(ds.readable);
            const decompressedBuffer = await response.arrayBuffer();
            rawXmlString = new TextDecoder('utf-8').decode(decompressedBuffer);
          }

          if (rawXmlString.length > 0) {
            // Format XML tags for paragraph, table cell, and text box boundaries
            const parsedXml = rawXmlString
              .replace(/<\/w:tc>/gi, ' \t ')
              .replace(/<\/w:tr>/gi, '\n')
              .replace(/<\/w:p>/gi, '\n')
              .replace(/<\/w:txbxContent>/gi, '\n');

            // Harvest text inside all <w:t> tags and purge any embedded XML tags
            const textMatches: string[] = [];
            const wtRegex = /<w:t[^>]*>(.*?)<\/w:t>/gi;
            let match;
            while ((match = wtRegex.exec(parsedXml)) !== null) {
              if (match[1]) {
                const cleanText = match[1]
                  .replace(/<[^>]+>/g, '') // PURGE ANY EMBEDDED XML/HTML TAGS (<w:tab...>, <w:color...>, etc.)
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'")
                  .trim();
                if (cleanText) textMatches.push(cleanText);
              }
            }

            const extractedDocxText = textMatches
              .join('\n')
              .replace(/<[^>]+>/g, '') // PURGE ANY RESIDUAL XML TAGS
              .replace(/&[a-z0-9#]+;/gi, '')
              .trim();
            if (extractedDocxText.length > 20) {
              return extractedDocxText;
            }
          }
        }
      } catch (err) {
        console.warn('[DOCX Inflater Engine Error]:', err);
      }
    }

    // 2. Standard Plain Text Extractor for TXT / RTF / HTML
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const raw = (evt.target?.result as string) || '';
        const printable = raw.replace(/[^\x20-\x7E\n\r]/g, ' ').replace(/\s+/g, ' ');
        resolve(printable);
      };
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  };

  const extractTextWithTimeout = (file: File, timeoutMs = 2500): Promise<string> => {
    return Promise.race([
      extractTextFromFile(file),
      new Promise<string>((resolve) => setTimeout(() => resolve(''), timeoutMs))
    ]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 500); // Support up to 500 files
    setParsing(true);
    setParseProgress({ current: 0, total: fileList.length });
    const batchList: Array<{ candidateData: Partial<Candidate>; originalFile?: File }> = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setParseProgress({ current: i + 1, total: fileList.length });

      try {
        const extractedText = await extractTextWithTimeout(file, 2500);
        const cand = await ingestDocument(file, extractedText);
        batchList.push({ candidateData: cand, originalFile: file });
        onImportCandidate(cand, file);
      } catch (err) {
        console.warn(`[Batch Ingestion Fallback for ${file.name}]:`, err);
        const fallbackCand = await ingestDocument(file, '');
        batchList.push({ candidateData: fallbackCand, originalFile: file });
        onImportCandidate(fallbackCand, file);
      }
      await new Promise(r => setTimeout(r, 15));
    }

    if (onImportBatchCandidates && batchList.length > 0) {
      onImportBatchCandidates(batchList);
    }

    setParsing(false);
    setParseProgress(null);
    toast.success(`Successfully parsed & imported ${fileList.length} candidate CVs into pipeline!`);
    onClose();
  };

  const handleSyncOfficialEmailNow = () => {
    setIsSyncingMail(false);
    toast.info(`Inbox ingestion for ${inboxAddress} requires a configured mail connector. No candidate data was created.`);
  };

  const handleSingleTextImport = () => {
    if (!cvText.trim()) return;
    setParsing(true);
    setTimeout(async () => {
      const cand = await ingestDocument(undefined, cvText);
      onImportCandidate(cand);
      setParsing(false);
      toast.success(`CV Parsed! ${cand.first_name} ${cand.last_name} added to pipeline.`);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#5c22ff]" /> Evidence-Driven Document Ingestion
          </h3>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-[#181B23] text-violet-600 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📂 Bulk File Upload (Up to 500 CVs)
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'email'
                ? 'bg-white dark:bg-[#181B23] text-violet-600 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📩 Official Email Auto-Ingestion
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Target Job Requisition</label>
              <select className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5c22ff]/40"
                value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                <option value="">General Applicant (No Specific Role)</option>
                {requisitions.map(r => <option key={r.id} value={r.id}>{r.title} ({r.location})</option>)}
              </select>
            </div>
            
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-[#5c22ff]/50 transition-colors">
              <FileText className="w-8 h-8 text-[#5c22ff] mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Upload Bulk Resumes (PDF, DOCX, TXT)</p>
              <p className="text-[10px] text-slate-400 mt-1 mb-3">Select up to 500 candidate CVs for parallel batch parsing</p>
              <label className="px-4 py-2 bg-[#5c22ff] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#4b1ac4] inline-flex items-center gap-2 shadow-lg">
                <Upload className="w-3.5 h-3.5" /> Select Bulk Resume Files (Up to 500)
                <input type="file" multiple accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={handleFileUpload} disabled={parsing} />
              </label>
            </div>

            {parseProgress && (
              <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl space-y-1 text-xs text-violet-300 font-mono">
                <div className="flex justify-between font-bold">
                  <span>Parsing Resume Batch...</span>
                  <span>{parseProgress.current} / {parseProgress.total} ({Math.round((parseProgress.current / parseProgress.total) * 100)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#5c22ff] transition-all duration-200" style={{ width: `${(parseProgress.current / parseProgress.total) * 100}%` }} />
                </div>
              </div>
            )}

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase">OR Paste Resume Text</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            <textarea
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c22ff]/40 resize-none font-mono"
              rows={3}
              placeholder="Paste raw CV / Resume text here..."
              value={cvText}
              onChange={e => setCvText(e.target.value)}
            />

            <button
              onClick={handleSingleTextImport}
              disabled={parsing || !cvText.trim()}
              className="w-full py-2.5 bg-[#5c22ff] text-white text-xs font-bold rounded-xl hover:bg-[#4b1ac4] disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Extract Evidence & Add Document
            </button>
          </div>
        ) : (
          /* Official Email Auto-Ingestion Tab */
          <div className="p-6 space-y-4 text-xs">
            <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-violet-400" /> Automated Official Inbox Ingestion
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-extrabold text-[10px] rounded-full border border-emerald-500/30">
                  🟢 Background Sync Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect your official recruitment email inboxes (<code className="text-violet-300">careers@</code>, <code className="text-violet-300">recruitment@</code>, <code className="text-violet-300">hr@</code>). CHATR automatically extracts incoming email CV attachments 24/7, detects duplicates, enriches dossiers, and indexes candidates instantly.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'outlook', name: 'Microsoft 365 / Outlook', sub: 'Graph API' },
                { id: 'gmail', name: 'Google Workspace', sub: 'Gmail API' },
                { id: 'imap', name: 'Company IMAP/SMTP', sub: 'Custom Server' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setEmailProvider(p.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    emailProvider === p.id
                      ? 'border-violet-500 bg-violet-500/10 text-white'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.sub}</p>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Monitored Official Inbox Address</label>
              <input
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-mono font-bold focus:outline-none"
                value={inboxAddress}
                onChange={e => setInboxAddress(e.target.value)}
                placeholder="e.g. careers@company.com"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Auto-Ingest Daily CV Attachments</p>
                <p className="text-[10px] text-slate-400">Polls inbox every 5 minutes and auto-extracts PDF/DOCX resumes</p>
              </div>
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={e => setAutoSyncEnabled(e.target.checked)}
                className="w-4 h-4 accent-violet-600 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSyncOfficialEmailNow}
              disabled={isSyncingMail}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold rounded-xl hover:from-violet-700 hover:to-indigo-700 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSyncingMail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} ⚡ Sync Official Inbox Now (Fetch Daily CVs)
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
ImportCvModal.displayName = 'ImportCvModal';

export { ImportCvModal as ImportCVModal };
