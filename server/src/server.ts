import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { freeWebScrape } from '../../searchProvider.js';
import { IntentClassifier } from './intentClassifier.js';
import { RetrievalFilter } from './retrievalFilter.js';
import { RetrievalLogger } from './logger.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const handleSearchStream = async (req: express.Request, res: express.Response) => {
  const startMs = Date.now();
  let query = (req.query.q as string) || "";
  if (!query) return res.status(400).json({ error: "Empty query string." });

  query = query.replace(/(.+?)\1+/gi, "$1").trim();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Phase 1: Intent & Expansion
  const intentResult = IntentClassifier.classify(query);
  
  // Phase 1: Retrieval (Using the 0-cost crawler for now)
  // In Phase 3 this will be multi-provider orchestrated
  let rawSources = [];
  try {
    rawSources = await freeWebScrape(intentResult.expandedQueries[0] || query);
  } catch (error) {
    console.error("Retrieval failed", error);
  }

  // Phase 1: Trust Scoring & Retrieval Filtering
  const rankedSources = RetrievalFilter.filterAndRank(query, rawSources, intentResult);

  const endMs = Date.now();
  
  // Observability Logging
  RetrievalLogger.log({
    query,
    expandedQueries: intentResult.expandedQueries,
    selectedSources: rankedSources.map(s => s.url),
    rejectedSources: rawSources.filter(r => !rankedSources.some(s => s.url === r.url)).map(r => r.url),
    scores: Object.fromEntries(rankedSources.map(s => [s.url, s.compositeScore])),
    providerUsed: 'duckduckgo-html',
    latencyMs: endMs - startMs
  });

  const mappedCards = rankedSources.map((s, index) => ({
    ...s,
    index: index + 1,
    source: TrustScorer.extractDomain(s.url)
  }));

  res.write(`data: ${JSON.stringify({ type: 'sources', cards: mappedCards })}\n\n`);

  // To-Do: Phase 2 AI Synthesis & Semantic Reranking will drop in here
  res.write(`data: ${JSON.stringify({ type: 'token', token: `Phase 1 Retrieval pipeline execution complete. Detected Intent: ${intentResult.intent}. Ranked ${rankedSources.length} sources.` })}\n\n`);
  res.write(`data: ${JSON.stringify({ status: 'complete' })}\n\n`);
  res.end();
};

app.get('/api/search/fast-stream', handleSearchStream);
app.get('/api/search/agent', handleSearchStream);

const PORT = 8787;
app.listen(PORT, () => {
  console.log(`Phase 1 TSX Search Server active on port ${PORT}`);
});
