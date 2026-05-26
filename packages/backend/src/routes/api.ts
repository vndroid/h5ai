import { execSync } from 'node:child_process';
import type { FastifyInstance } from 'fastify';
import type { ApiRequest, GetResponse, SetupInfo } from '@h5ai/types';
import { config } from '../config.js';
import { getItems } from '../services/items.js';
import { generateThumb } from '../services/thumbs.js';
import { search } from '../services/search.js';
import { getCustomizations } from '../services/custom.js';
import { getL10n, getAvailableLangs } from '../services/l10n.js';
import { isAdmin, login, logout } from '../services/auth.js';
import { streamArchive } from '../services/archive.js';

function hasCmd(cmd: string): boolean {
  try {
    execSync(`which ${cmd} 2>/dev/null`, { encoding: 'utf-8' }).trim();
    return true;
  } catch {
    return false;
  }
}

function buildSetupInfo(admin: boolean): SetupInfo {
  return {
    version: config.version,
    rootHref: '/',
    publicHref: '/_h5ai/public/',
    hasShellTar: hasCmd('tar'),
    hasShellZip: hasCmd('zip'),
    hasPhpExif: false,
    hasPhpGd: false,
    hasFfmpeg: hasCmd('ffmpeg'),
    hasConvert: hasCmd('convert'),
    hasAvconv: hasCmd('avconv'),
    isAdmin: admin,
  };
}

export async function apiRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /api — main JSON API ─────────────────────────────────────────────
  app.post<{ Body: ApiRequest }>('/api', async (request, reply) => {
    const body = request.body;

    if (body.action === 'login') {
      const ok = login(request, body.password);
      return reply.send({ isAdmin: ok });
    }

    if (body.action === 'logout') {
      logout(request);
      return reply.send({ isAdmin: false });
    }

    if (body.action !== 'get') {
      return reply.status(400).send({ error: 'unsupported action' });
    }

    const admin = isAdmin(request);
    const response: GetResponse = {};

    if (body.options) {
      // Strip passhash from client response
      const { passhash: _, ...safeOptions } = config.options as typeof config.options & { passhash?: string };
      response.options = safeOptions as typeof config.options;
    }

    if (body.types) {
      response.types = config.types;
    }

    if (body.setup) {
      response.setup = buildSetupInfo(admin);
    }

    if (body.theme) {
      // Return empty theme map — frontend uses CSS/SVG icons
      response.theme = {};
    }

    if (body.langs) {
      response.langs = await getAvailableLangs();
    }

    if (body.items) {
      response.items = await getItems(body.items.href, body.items.what);
    }

    if (body.search) {
      response.search = await search(
        body.search.href,
        body.search.pattern,
        body.search.ignorecase,
      );
    }

    if (body.thumbs && body.thumbs.length > 0) {
      response.thumbs = await Promise.all(body.thumbs.map((t) => generateThumb(t)));
    }

    if (body.custom) {
      if (config.options.custom.enabled) {
        response.custom = await getCustomizations(body.custom);
      }
    }

    if (body.l10n && body.l10n.length > 0) {
      if (config.options.l10n.enabled) {
        response.l10n = await getL10n(body.l10n);
      }
    }

    return reply.send(response);
  });

  // ── POST /api/download — packaged archive download ───────────────────────
  app.post<{
    Body: {
      as: string;
      type: string;
      baseHref: string;
      hrefs: string;
    };
  }>('/api/download', async (request, reply) => {
    if (!config.options.download.enabled) {
      return reply.status(403).send({ error: 'download disabled' });
    }

    const { as, type, baseHref, hrefs } = request.body;
    const hrefList = hrefs.split('\n').filter(Boolean);
    const archiveType = type.includes('zip') ? 'zip' : 'tar';
    const packageName = as?.replace(/\.(tar\.gz|zip)$/, '') ?? 'download';

    await streamArchive(reply, archiveType, baseHref, hrefList, packageName);
  });
}
