import { Span } from './TraceProvider';

export class MetricsExporter {
  private static instance: MetricsExporter;
  private spans: Span[] = [];

  private constructor() {}

  public static getInstance(): MetricsExporter {
    if (!MetricsExporter.instance) {
      MetricsExporter.instance = new MetricsExporter();
    }
    return MetricsExporter.instance;
  }

  public exportSpan(span: Span): void {
    this.spans.push(span);
  }

  public printTraceTree(traceId: string): void {
    const traceSpans = this.spans.filter(s => s.context.traceId === traceId);
    if (traceSpans.length === 0) return;

    console.log(`\n--- APM TRACE TIMELINE [${traceId}] ---`);
    
    // Build tree
    const rootSpans = traceSpans.filter(s => !s.context.parentSpanId);
    
    const printNode = (span: Span, depth: number) => {
      const indent = '  '.repeat(depth);
      const duration = (span.endTime || Date.now()) - span.startTime;
      const attributes = Object.keys(span.attributes).length > 0 
        ? JSON.stringify(span.attributes) 
        : '';
      
      console.log(`${indent}├─ [${span.context.spanId}] ${span.name} (${duration}ms) ${attributes}`);
      
      const children = traceSpans.filter(s => s.context.parentSpanId === span.context.spanId);
      // sort by start time
      children.sort((a, b) => a.startTime - b.startTime).forEach(c => printNode(c, depth + 1));
    };

    rootSpans.forEach(root => printNode(root, 0));
    console.log('---------------------------------------\n');
  }
}
