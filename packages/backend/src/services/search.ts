import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import type { FileItem } from '@h5ai/types';
import { buildItem, hrefToPath } from './items.js';

/**
 * Recursively search for files/folders matching a regex pattern.
 */
export async function search(
  baseHref: string,
  pattern: string,
  ignorecase: boolean,
): Promise<FileItem[]> {
  const basePath = hrefToPath(baseHref);
  const flags = ignorecase ? 'i' : '';
  let regex: RegExp;

  try {
    regex = new RegExp(pattern, flags);
  } catch {
    // Invalid regex — treat as literal substring
    regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
  }

  const results: FileItem[] = [];
  await walk(basePath, regex, results);
  return results;
}

async function walk(
  dirPath: string,
  regex: RegExp,
  results: FileItem[],
): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(dirPath);
  } catch {
    return;
  }

  for (const name of entries) {
    if (regex.test(name)) {
      const item = await buildItem(path.join(dirPath, name));
      if (item) results.push(item);
    }
    const childPath = path.join(dirPath, name);
    try {
      const s = await stat(childPath);
      if (s.isDirectory()) await walk(childPath, regex, results);
    } catch { /* skip */ }
  }
}
