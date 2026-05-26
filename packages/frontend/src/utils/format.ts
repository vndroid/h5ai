import type { ViewOptions } from '@h5ai/types';

const BINARY_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
const DECIMAL_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export function formatSize(bytes: number | null, binaryPrefix = false): string {
  if (bytes === null) return '—';
  if (bytes === 0) return '0 B';

  const units = binaryPrefix ? BINARY_UNITS : DECIMAL_UNITS;
  const divisor = binaryPrefix ? 1024 : 1000;

  let size = bytes;
  let unitIndex = 0;

  while (size >= divisor && unitIndex < units.length - 1) {
    size /= divisor;
    unitIndex++;
  }

  return `${size < 10 ? size.toFixed(1) : Math.round(size)} ${units[unitIndex]}`;
}

export function formatDate(timeMs: number, viewOptions?: ViewOptions): string {
  if (!timeMs) return '—';
  const d = new Date(timeMs);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
