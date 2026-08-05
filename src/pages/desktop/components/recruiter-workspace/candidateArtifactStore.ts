import { supabase } from '@/integrations/supabase/client';
import type { Candidate, CandidateSourceArtifact } from './types';
import { ResumeIntelligencePipeline } from './resumeIntelligence';

const LOCAL_ARTIFACTS_KEY = 'chatr_rec_candidate_artifacts_v1';

function readLocalArtifacts(): Record<string, CandidateSourceArtifact> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ARTIFACTS_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLocalArtifact(candidateId: string, artifact: CandidateSourceArtifact): void {
  const artifacts = readLocalArtifacts();
  artifacts[candidateId] = artifact;
  localStorage.setItem(LOCAL_ARTIFACTS_KEY, JSON.stringify(artifacts));
}

export async function persistCandidateSourceArtifact(
  candidateId: string,
  artifact: CandidateSourceArtifact | undefined,
  originalFile?: File
): Promise<CandidateSourceArtifact | undefined> {
  if (!artifact) return undefined;
  let persisted = artifact;
  if (originalFile) {
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const path = `${auth.user.id}/${candidateId}/${artifact.id}-${originalFile.name}`;
      const { error } = await supabase.storage.from('candidate-documents').upload(path, originalFile, { upsert: false });
      if (!error) persisted = { ...artifact, storage_path: path };
    }
  }
  writeLocalArtifact(candidateId, persisted);
  return persisted;
}

export async function persistCandidateParseHistory(candidateId: string, artifact: CandidateSourceArtifact): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  const documentPayload = {
    candidate_id: candidateId,
    user_id: auth.user.id,
    storage_path: artifact.storage_path || null,
    original_file_name: artifact.original_file_name,
    mime_type: artifact.mime_type,
    native_text: artifact.native_text || null,
    ocr_output: artifact.ocr_output || null,
    layout_graph: artifact.layout_graph || null,
    knowledge_graph: artifact.knowledge_graph || null,
    parser_versions: artifact.parser_versions,
  };
  const { data: document, error } = await (supabase as any)
    .from('rec_candidate_documents')
    .upsert(documentPayload, { onConflict: 'candidate_id,storage_path' })
    .select('id')
    .single();
  if (error) throw error;
  const { error: historyError } = await (supabase as any).from('rec_candidate_parse_versions').insert({
    candidate_id: candidateId,
    document_id: document?.id || null,
    user_id: auth.user.id,
    parser_versions: artifact.parser_versions,
    knowledge_graph: artifact.knowledge_graph || null,
    validation_result: { parser_versions: artifact.parser_versions }
  });
  if (historyError) throw historyError;
}

export async function reprocessCandidateFromSource(candidate: Candidate): Promise<Candidate> {
  const artifact = candidate.source_artifact || readLocalArtifacts()[candidate.id];
  const sourceText = artifact?.native_text || artifact?.ocr_output;
  if (!artifact || !sourceText) {
    throw new Error('Original text artifact is unavailable. This legacy record requires one re-upload before future parser migrations can run.');
  }

  const result = await new ResumeIntelligencePipeline().process({
    name: artifact.original_file_name,
    mimeType: artifact.mime_type,
    nativeText: sourceText,
    receivedAt: new Date().toISOString()
  });
  const nextArtifact = result.candidate.source_artifact!;
  nextArtifact.storage_path = artifact.storage_path;
  nextArtifact.parse_history = [
    ...artifact.parse_history,
    {
      parsed_at: artifact.parsed_at,
      parser_versions: artifact.parser_versions,
      knowledge_graph: artifact.knowledge_graph
    }
  ];
  const reprocessed: Candidate = {
    ...candidate,
    ...result.candidate,
    id: candidate.id,
    status: candidate.status,
    applied_for: candidate.applied_for,
    created_at: candidate.created_at,
    source_artifact: nextArtifact
  } as Candidate;
  writeLocalArtifact(candidate.id, nextArtifact);
  return reprocessed;
}
