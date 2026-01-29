import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { JSDOM } from 'jsdom';

import * as geminiService from '../services/geminiService';

const dom = new JSDOM('<!DOCTYPE html>');
(globalThis as any).window = dom.window as any;
(globalThis as any).document = dom.window.document;
(globalThis as any).DOMParser = dom.window.DOMParser;

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const allowedActions = new Set([
  'generateLandingPage',
  'hydrateSectionContent',
  'regenerateSectionWithCRO',
  'generateStudioImage',
  'analyzeExternalProduct',
  'generateBookOutline',
  'generateChapterContent',
  'reviewChapterContent',
  'generateVslScript',
  'generateSpeech',
  'refineLandingPageContent',
  'injectAssetIntoPage',
  'generateCreativeCampaign',
  'generateMarketingIdeas',
  'generatePaidAdsPlan',
  'generatePaidCampaignStrategy',
  'generateABVariation',
  'simulateHeatmap',
  'rewriteElementText',
  'generateSeoFromSections'
]);

app.post('/api/genai', async (req, res) => {
  const { action, args } = req.body;
  if (!action || !allowedActions.has(action)) {
    return res.status(400).json({ error: 'Ação inválida' });
  }
  const handler = (geminiService as any)[action];
  if (typeof handler !== 'function') {
    return res.status(400).json({ error: 'Ação não disponível' });
  }
  try {
    const result = await handler(...(Array.isArray(args) ? args : []));
    return res.json({ result });
  } catch (error: any) {
    console.error(`[proxy] ${action} failed`, error);
    return res.status(500).json({ error: error.message || 'Erro no servidor' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const port = process.env.API_PORT ? Number(process.env.API_PORT) : 4001;
app.listen(port, () => {
  console.log(`AI proxy listening on http://localhost:${port}`);
});
