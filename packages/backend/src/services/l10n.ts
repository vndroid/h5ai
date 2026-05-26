import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';

const cache: Record<string, Record<string, string>> = {};

export async function getL10n(
  isoCodes: string[],
): Promise<Record<string, Record<string, string>>> {
  const result: Record<string, Record<string, string>> = {};

  await Promise.all(
    isoCodes.map(async (code) => {
      if (cache[code]) {
        result[code] = cache[code];
        return;
      }
      const file = path.join(config.l10nDir, `${code}.json`);
      try {
        const raw = await readFile(file, 'utf-8');
        const parsed = JSON.parse(raw) as Record<string, string>;
        cache[code] = parsed;
        result[code] = parsed;
      } catch {
        // unknown locale — skip
      }
    }),
  );

  return result;
}

export async function getAvailableLangs(): Promise<Record<string, string>> {
  const { readdir } = await import('node:fs/promises');
  const files = await readdir(config.l10nDir);
  const langs: Record<string, string> = {};

  await Promise.all(
    files
      .filter((f) => f.endsWith('.json'))
      .map(async (f) => {
        const code = f.replace('.json', '');
        const file = path.join(config.l10nDir, f);
        try {
          const raw = await readFile(file, 'utf-8');
          const parsed = JSON.parse(raw) as Record<string, string>;
          langs[code] = parsed['lang'] ?? code;
        } catch {
          langs[code] = code;
        }
      }),
  );

  return langs;
}
