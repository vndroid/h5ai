import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { config } from '../config.js';
import { hrefToPath } from './items.js';
import type { ThumbRequest } from '@h5ai/types';

const execFileAsync = promisify(execFile);

/** Returns the cached thumb href, or null if generation failed */
export async function generateThumb(req: ThumbRequest): Promise<string | null> {
  const { type, href, width, height } = req;
  const srcPath = hrefToPath(href);

  if (!existsSync(srcPath)) return null;

  const key = createHash('sha1')
    .update(`${href}:${width}:${height}`)
    .digest('hex');
  const thumbDir = path.join(config.thumbsCacheDir);
  const thumbFile = path.join(thumbDir, `${key}.jpg`);
  const thumbHref = `/_h5ai/cache/thumbs/${key}.jpg`;

  if (existsSync(thumbFile)) return thumbHref;

  try {
    await mkdir(thumbDir, { recursive: true });

    if (type === 'img') {
      await generateImageThumb(srcPath, thumbFile, width, height);
    } else if (type === 'mov') {
      await generateVideoThumb(srcPath, thumbFile, width, height);
    } else if (type === 'doc') {
      await generateDocThumb(srcPath, thumbFile, width, height);
    }

    return existsSync(thumbFile) ? thumbHref : null;
  } catch {
    return null;
  }
}

async function generateImageThumb(
  src: string,
  dest: string,
  width: number,
  height: number,
): Promise<void> {
  // Try sharp first (best performance)
  try {
    const sharp = await import('sharp');
    await sharp
      .default(src)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(dest);
    return;
  } catch {
    // fall through to ImageMagick
  }

  // Fall back to ImageMagick convert
  const cmd = which('convert') ?? which('gm');
  if (cmd) {
    const resizeArg = `${width}x${height}>`;
    const args =
      cmd === 'gm'
        ? ['convert', src, '-resize', resizeArg, dest]
        : [src, '-resize', resizeArg, dest];
    await execFileAsync(cmd, args);
  }
}

async function generateVideoThumb(
  src: string,
  dest: string,
  width: number,
  height: number,
): Promise<void> {
  const ffmpeg = which('ffmpeg') ?? which('avconv');
  if (!ffmpeg) return;

  await execFileAsync(ffmpeg, [
    '-i', src,
    '-ss', '00:00:01.000',
    '-vframes', '1',
    '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
    '-y', dest,
  ]);
}

async function generateDocThumb(
  src: string,
  dest: string,
  width: number,
  height: number,
): Promise<void> {
  const convert = which('convert') ?? which('gm');
  if (!convert) return;

  const resizeArg = `${width}x${height}>`;
  const args =
    convert === 'gm'
      ? ['convert', `${src}[0]`, '-resize', resizeArg, dest]
      : [`${src}[0]`, '-resize', resizeArg, dest];

  await execFileAsync(convert, args);
}

// Simple synchronous PATH lookup
import { execSync } from 'node:child_process';

const _whichCache: Record<string, string | null> = {};

function which(cmd: string): string | null {
  if (cmd in _whichCache) return _whichCache[cmd]!;
  try {
    const result = execSync(`which ${cmd} 2>/dev/null`, { encoding: 'utf-8' }).trim();
    _whichCache[cmd] = result || null;
  } catch {
    _whichCache[cmd] = null;
  }
  return _whichCache[cmd];
}
