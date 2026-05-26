import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySession from '@fastify/session';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { apiRoutes } from './routes/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = Fastify({ logger: { level: 'info' } });

// ── Plugins ────────────────────────────────────────────────────────────────
await app.register(fastifyCors, {
  origin: process.env['NODE_ENV'] === 'development' ? 'http://localhost:5173' : false,
  credentials: true,
});

await app.register(fastifyCookie);

await app.register(fastifySession, {
  secret: config.sessionSecret,
  cookie: {
    secure: process.env['NODE_ENV'] === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
  saveUninitialized: false,
});

// ── Serve thumb cache ──────────────────────────────────────────────────────
await app.register(fastifyStatic, {
  root: config.thumbsCacheDir,
  prefix: '/_h5ai/cache/thumbs/',
  decorateReply: false,
});

// ── Serve files from root directory ───────────────────────────────────────
await app.register(fastifyStatic, {
  root: config.rootPath,
  prefix: '/',
  decorateReply: true,
  serve: false, // we handle this manually to support directory listing
});

// ── API Routes ─────────────────────────────────────────────────────────────
await app.register(apiRoutes);

// ── Start ──────────────────────────────────────────────────────────────────
try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
  console.log(`h5ai-next backend listening on http://localhost:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
