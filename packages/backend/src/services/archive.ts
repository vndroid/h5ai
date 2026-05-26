import { createReadStream, existsSync } from 'node:fs';
import { stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import archiver from 'archiver';
import type { FastifyReply } from 'fastify';
import { hrefToPath } from './items.js';

export type ArchiveType = 'tar' | 'zip';

/**
 * Stream a tar or zip archive of the selected hrefs to the HTTP response.
 */
export async function streamArchive(
  reply: FastifyReply,
  type: ArchiveType,
  baseHref: string,
  hrefs: string[],
  packageName: string,
): Promise<void> {
  const format = type === 'zip' ? 'zip' : 'tar';
  const ext = type === 'zip' ? '.zip' : '.tar.gz';
  const filename = `${packageName}${ext}`;

  const archive = archiver(format, {
    zlib: { level: 6 },
    ...(format === 'tar' ? { gzip: true, gzipOptions: { level: 6 } } : {}),
  });

  void reply.raw.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Connection': 'close',
  });

  archive.pipe(reply.raw);

  archive.on('error', (err) => {
    console.error('[archive] error:', err);
    reply.raw.end();
  });

  const basePath = hrefToPath(baseHref);

  for (const href of hrefs) {
    const absPath = hrefToPath(href);
    if (!existsSync(absPath)) continue;

    const entryName = path.relative(basePath, absPath);
    const s = await stat(absPath);

    if (s.isDirectory()) {
      archive.directory(absPath, entryName);
    } else {
      archive.append(createReadStream(absPath), { name: entryName });
    }
  }

  await archive.finalize();
}
