import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import type { FileItem } from '@h5ai/types';
import { config } from '../config.js';

/** Convert absolute filesystem path → href (URL path relative to rootPath) */
export function pathToHref(absPath: string, isDir: boolean): string {
  let rel = absPath.slice(config.rootPath.length).replace(/\\/g, '/');
  if (!rel.startsWith('/')) rel = '/' + rel;
  if (isDir && !rel.endsWith('/')) rel += '/';
  return rel;
}

/** Convert href → absolute filesystem path */
export function hrefToPath(href: string): string {
  return path.join(config.rootPath, href);
}

/** Check whether a filename should be hidden based on options */
function isHidden(name: string): boolean {
  return config.options.view.hidden.some(pattern => new RegExp(pattern).test(name));
}

/** Check whether a directory is "unmanaged" (contains index file) */
async function isUnmanaged(dirPath: string): Promise<boolean> {
  for (const name of config.options.view.unmanaged) {
    try {
      await stat(path.join(dirPath, name));
      return true;
    } catch {
      // file does not exist
    }
  }
  return false;
}

/**
 * Build a FileItem for a single path.
 * Returns null if the path doesn't exist or is inaccessible.
 */
export async function buildItem(absPath: string): Promise<FileItem | null> {
  try {
    const s = await stat(absPath);
    const isDir = s.isDirectory();
    const href = pathToHref(absPath, isDir);
    const item: FileItem = {
      href,
      time: s.mtimeMs,
      size: isDir ? null : s.size,
    };
    if (isDir) {
      item.managed = !(await isUnmanaged(absPath));
      item.fetched = false;
    }
    return item;
  } catch {
    return null;
  }
}

/**
 * List directory contents.
 * what=1  → this folder's contents only
 * what=2  → this folder + immediate sub-folder contents
 */
export async function getItems(href: string, what: 1 | 2): Promise<FileItem[]> {
  const dirPath = hrefToPath(href);
  const results: FileItem[] = [];

  // Always include the requested folder itself
  const self = await buildItem(dirPath);
  if (self) results.push(self);

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const children: string[] = [];

    for (const entry of entries) {
      if (isHidden(entry.name)) continue;
      if (config.options.view.hideFolders && entry.isDirectory()) continue;

      const absChild = path.join(dirPath, entry.name);
      const item = await buildItem(absChild);
      if (item) {
        results.push(item);
        if (what === 2 && entry.isDirectory()) children.push(absChild);
      }
    }

    if (what === 2) {
      for (const childDir of children) {
        const subEntries = await readdir(childDir, { withFileTypes: true });
        for (const entry of subEntries) {
          if (isHidden(entry.name)) continue;
          const item = await buildItem(path.join(childDir, entry.name));
          if (item) results.push(item);
        }
      }
    }
  } catch {
    // Directory not readable
  }

  return results;
}
