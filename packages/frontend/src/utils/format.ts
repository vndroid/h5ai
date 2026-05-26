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
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  const hh   = String(d.getHours()).padStart(2, '0');
  const min  = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}
