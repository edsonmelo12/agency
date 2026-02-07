import './env.ts';
import cors from 'cors';
import express from 'express';
import { JSDOM } from 'jsdom';
import prismaPkg from '@prisma/client';
import bcrypt from 'bcrypt';
import jwtPkg from 'jsonwebtoken';
import { z } from 'zod';

import * as geminiService from '../services/geminiService.ts';

type AuthenticatedRequest = express.Request & {
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

const dom = new JSDOM('<!DOCTYPE html>');
(globalThis as any).window = dom.window as any;
(globalThis as any).document = dom.window.document;
(globalThis as any).DOMParser = dom.window.DOMParser;

const { PrismaClient } = prismaPkg;
type User = prismaPkg.User;
const prisma = new PrismaClient();
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-jwt-secret';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL ?? '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL ?? '7d';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(64).optional(),
});

const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']).optional(),
  name: z.string().min(2).max(64).optional(),
});

const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['user', 'admin']).optional(),
  name: z.string().min(2).max(64).optional(),
});

const projectPayloadSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  status: z.string().min(1),
  stage: z.string().min(1).optional(),
  context: z.any().optional(),
});

const projectSyncSchema = projectPayloadSchema.extend({
  version: z.number().int().nonnegative(),
  context: z.any(),
});

const creativeSchema = z.object({
  payload: z.any(),
  channel: z.string().min(1),
  status: z.string().min(1).optional().default('draft'),
});

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
  'generateCreativeVariants',
  'generateMarketingIdeas',
  'generatePaidAdsPlan',
  'generatePaidCampaignStrategy',
  'generateABVariation',
  'simulateHeatmap',
  'rewriteElementText',
  'generateSeoFromSections'
]);

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const { sign, verify } = jwtPkg;
type JwtPayload = jwtPkg.JwtPayload;

const createTokens = (user: { id: string; email: string; role: string }) => {
  const payload = { sub: user.id, email: user.email, role: user.role };
  return {
    accessToken: sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL }),
    refreshToken: sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_TTL }),
  };
};

const setEtag = (res: express.Response, version: number) => {
  if (Number.isFinite(version)) {
    res.setHeader('ETag', `W/"${version}"`);
  }
};

const logPersistence = async (
  userId: string,
  projectId: string | null,
  action: string,
  details?: Record<string, any>
) => {
  await prisma.persistenceLog.create({
    data: {
      userId,
      projectId,
      action,
      details: details ? JSON.stringify(details) : null,
    },
  });
};

const sanitizeUser = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name ?? '',
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLoginAt: user.lastLoginAt,
});

const authenticate = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não enviado' });
  }
  const token = header.replace('Bearer ', '').trim();
  try {
    const payload = verify(token, JWT_SECRET) as JwtPayload & { sub?: string; email?: string };
    if (!payload.sub) {
      throw new Error('Token sem subject');
    }
    req.user = {
      id: payload.sub,
      email: payload.email ?? '',
      role: payload.role ?? 'user',
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const ensureAdmin = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Admin privileges required' });
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    const role = adminCount === 0 ? 'admin' : 'user';
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role, name },
    });
    const tokens = createTokens(user);
    await logPersistence(user.id, null, 'user:register', { role });
    return res.status(201).json({ user: sanitizeUser(user), ...tokens });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Payload inválido' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const updated = await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const tokens = createTokens(updated);
    return res.json({ user: sanitizeUser(updated), ...tokens });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Payload inválido' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = (req.body && req.body.refreshToken) || req.headers['x-refresh-token'];
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token obrigatório' });
  }
  try {
    const payload = verify(refreshToken, JWT_SECRET) as JwtPayload & { sub?: string };
    if (!payload.sub) {
      throw new Error('Refresh inválido');
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    const tokens = createTokens(user);
    return res.json({ user: sanitizeUser(user), ...tokens });
  } catch (error) {
    return res.status(401).json({ error: 'Refresh token inválido' });
  }
});

app.get('/api/users', authenticate, ensureAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(users.map(sanitizeUser));
});

app.get('/api/users/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  if (req.user!.role !== 'admin' && req.user!.id !== user.id) {
    return res.status(403).json({ error: 'Sem permissão' });
  }
  return res.json(sanitizeUser(user));
});

app.put('/api/users/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const payload = userUpdateSchema.parse(req.body);
    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const isSelf = targetUser.id === req.user!.id;
    if (!isSelf && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    const updates: Record<string, any> = {};
    if (payload.email) updates.email = payload.email;
    if (payload.password) updates.password = await bcrypt.hash(payload.password, SALT_ROUNDS);
    if (payload.role) {
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Somente admin pode alterar role' });
      }
      updates.role = payload.role;
    }
    if (payload.name) updates.name = payload.name;
    const updated = await prisma.user.update({
      where: { id: targetUser.id },
      data: updates,
    });
    await logPersistence(req.user!.id, null, 'user:update', { target: updated.id });
    return res.json(sanitizeUser(updated));
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Payload inválido' });
  }
});

app.delete('/api/users/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!targetUser) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  const isSelf = targetUser.id === req.user!.id;
  if (!isSelf && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Sem permissão' });
  }
  if (targetUser.role === 'admin' && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Somente admin pode remover outro admin' });
  }
  await prisma.user.delete({ where: { id: targetUser.id } });
  await logPersistence(req.user!.id, null, 'user:delete', { target: targetUser.id });
  return res.status(204).send();
});

app.get('/api/projects', authenticate, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
  const highestVersion = projects.reduce((max, project) => Math.max(max, project.version), 0);
  setEtag(res, highestVersion);
  return res.json(projects);
});

app.post('/api/projects', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const payload = projectPayloadSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        userId,
        name: payload.name,
        type: payload.type,
        status: payload.status,
        stage: payload.stage ?? 'draft',
        context: payload.context ?? {},
        syncedAt: new Date(),
      },
    });
    await logPersistence(userId, project.id, 'project:create', { name: project.name, version: project.version });
    setEtag(res, project.version);
    return res.status(201).json(project);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Payload inválido' });
  }
});

app.post('/api/projects/:id/sync', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const payload = projectSyncSchema.parse(req.body);
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Sem permissão para este projeto' });
    }
    if (payload.version < existing.version) {
      return res.status(409).json({
        error: 'Versão desatualizada',
        serverVersion: existing.version,
        serverContext: existing.context,
      });
    }
    const updated = await prisma.project.update({
      where: { id: existing.id },
      data: {
        name: payload.name,
        type: payload.type,
        status: payload.status,
        stage: payload.stage ?? existing.stage,
        context: payload.context,
        version: existing.version + 1,
        syncedAt: new Date(),
      },
    });
    await logPersistence(userId, updated.id, 'project:sync', { version: updated.version });
    setEtag(res, updated.version);
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Payload inválido' });
  }
});

app.get('/api/projects/:id/sync-status', authenticate, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }
  if (project.userId !== userId) {
    return res.status(403).json({ error: 'Sem permissão' });
  }
  return res.json({ version: project.version, syncedAt: project.syncedAt, stage: project.stage });
});

app.post('/api/projects/:id/creatives', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const payload = creativeSchema.parse(req.body);
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    if (project.userId !== userId) {
      return res.status(403).json({ error: 'Sem permissão para este projeto' });
    }
    const creative = await prisma.creativeVariant.create({
      data: {
        projectId: project.id,
        payload: payload.payload,
        channel: payload.channel,
        status: payload.status ?? 'draft',
      },
    });
    await logPersistence(userId, project.id, 'creative:create', {
      creativeId: creative.id,
      channel: creative.channel,
    });
    return res.status(201).json(creative);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Payload inválido' });
  }
});

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
const host = process.env.API_HOST || '127.0.0.1';
app.listen(port, host, () => {
  console.log(`AI proxy listening on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
});
