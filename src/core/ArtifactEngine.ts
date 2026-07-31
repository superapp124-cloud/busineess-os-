import { Artifact, ArtifactState, Extractor, IArtifactEngine } from './types';

export class ArtifactEngine implements IArtifactEngine {
  private extractors: Extractor[] = [];

  registerExtractor(extractor: Extractor) {
    this.extractors.push(extractor);
  }

  async process(artifact: Artifact): Promise<ArtifactState> {
    // 1. Detect MIME/Extension (simplified for prototype)
    const mimeType = artifact.rawFile?.type || 'application/octet-stream';
    const extension = artifact.rawFile?.name.split('.').pop() || '';

    // 2. Find matching Extractor
    const extractor = this.extractors.find(e => e.supports(mimeType, extension));
    
    if (extractor) {
      return extractor.extract(artifact);
    }

    // 3. Fallback generic extraction
    return {
      artifact,
      metadata: { processedBy: 'FallbackExtractor' },
      content: artifact.rawText || 'No content extracted',
      entities: [],
      relationships: [],
      timeline: [{
        id: `t_${Date.now()}`,
        title: 'Artifact Received',
        timestamp: new Date().toISOString(),
      }],
      confidence: 0.5,
      source: { origin: 'upload' }
    };
  }
}
