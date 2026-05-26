import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AppOptions } from '@h5ai/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Strip JS-style comments (// and /* */) from JSON-like text
function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
}

function loadJson<T>(filePath: string): T {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(stripComments(raw)) as T;
}

export interface ServerConfig {
  /** Absolute path to the directory being served */
  rootPath: string;
  /** Port for the HTTP server */
  port: number;
  /** Session secret (override via SESSION_SECRET env var) */
  sessionSecret: string;
  /** h5ai version */
  version: string;
  /** App options from options.json */
  options: AppOptions;
  /** File type patterns from types.json */
  types: Record<string, string[]>;
  /** Absolute path to the conf directory */
  confDir: string;
  /** Absolute path to the l10n directory */
  l10nDir: string;
  /** Absolute path to the thumbs cache directory */
  thumbsCacheDir: string;
}

const confDir = path.resolve(__dirname, '../conf');

const options = loadJson<AppOptions>(path.join(confDir, 'options.json'));
const types = loadJson<Record<string, string[]>>(path.join(confDir, 'types.json'));

export const config: ServerConfig = {
  rootPath: process.env['ROOT_PATH'] ?? process.cwd(),
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  sessionSecret: process.env['SESSION_SECRET'] ?? 'h5ai-change-me-in-production-secret-key-32',
  version: '1.0.0',
  options,
  types,
  confDir,
  l10nDir: path.join(confDir, 'l10n'),
  thumbsCacheDir: process.env['THUMBS_CACHE_DIR'] ?? path.resolve(__dirname, '../cache/thumbs'),
};
