import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import { config } from '../config.js';
import { hrefToPath } from './items.js';
import type { CustomResponse } from '@h5ai/types';

type CustomSlot = 'header' | 'footer';

/**
 * Find the nearest custom HTML/Markdown file for a given slot by traversing
 * up the directory tree from `href`.
 */
async function findCustomFile(
  dirPath: string,
  slot: CustomSlot,
): Promise<{ content: string; type: 'html' | 'markdown' } | null> {
  const rootPath = config.rootPath;
  const stopAtRoot = config.options.custom.stopSearchingAtRoot;

  // Filenames to try: exact-dir file first, then cascading file
  const candidates = [
    `_h5ai.${slot}.html`,
    `_h5ai.${slot}.md`,
    `_h5ai.${slot}s.html`,
    `_h5ai.${slot}s.md`,
  ];

  let current = dirPath;

  while (true) {
    for (const name of candidates) {
      const file = path.join(current, name);
      try {
        await stat(file);
        const raw = await readFile(file, 'utf-8');
        const isMarkdown = name.endsWith('.md');
        const content = isMarkdown ? (await marked.parse(raw)) : raw;
        return { content, type: isMarkdown ? 'markdown' : 'html' };
      } catch {
        // not found, continue
      }
    }

    // Stop conditions
    if (stopAtRoot && current === rootPath) break;
    const parent = path.dirname(current);
    if (parent === current) break; // filesystem root
    current = parent;
  }

  return null;
}

export async function getCustomizations(href: string): Promise<CustomResponse> {
  const dirPath = hrefToPath(href);
  const [header, footer] = await Promise.all([
    findCustomFile(dirPath, 'header'),
    findCustomFile(dirPath, 'footer'),
  ]);

  const result: CustomResponse = {};
  if (header) result.header = header;
  if (footer) result.footer = footer;
  return result;
}
