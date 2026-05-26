import { useMemo } from 'react';
import type { FileItem } from '@h5ai/types';
import { useStore, type SortColumn } from '../store';

/** Returns a human-readable file type key from the types map */
export function useFileType(href: string): string {
  const types = useStore((s) => s.types);
  if (!types) return 'unknown';

  const name = href.split('/').filter(Boolean).pop() ?? '';
  for (const [key, patterns] of Object.entries(types)) {
    for (const pattern of patterns) {
      // Convert glob to regex: * → .*
      const re = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$', 'i');
      if (re.test(name)) return key;
    }
  }
  return 'unknown';
}

/** Returns the filtered and sorted list of items for the current view */
export function useSortedItems(items: FileItem[]): FileItem[] {
  const filterText = useStore((s) => s.filterText);
  const sortColumn = useStore((s) => s.sortColumn);
  const sortReverse = useStore((s) => s.sortReverse);
  const options = useStore((s) => s.options);

  return useMemo(() => {
    let result = items;

    // Apply filter
    if (filterText.trim()) {
      const lower = filterText.toLowerCase();
      result = result.filter((item) => {
        const name = item.href.split('/').filter(Boolean).pop() ?? '';
        return name.toLowerCase().includes(lower);
      });
    }

    // Always folders first
    const folders = result.filter((i) => i.managed !== undefined);
    const files = result.filter((i) => i.managed === undefined);

    const sortFn = buildSortFn(sortColumn, options?.view.binaryPrefix ?? false);

    return [
      ...folders.sort(sortFn),
      ...files.sort(sortFn),
    ].map((item, _i) => item)[sortReverse ? 'reverse' : 'slice']();
  }, [items, filterText, sortColumn, sortReverse, options]);
}

function buildSortFn(
  column: SortColumn,
  _binaryPrefix: boolean,
): (a: FileItem, b: FileItem) => number {
  return (a, b) => {
    switch (column) {
      case 'time':
        return (a.time ?? 0) - (b.time ?? 0);
      case 'size':
        return (a.size ?? 0) - (b.size ?? 0);
      case 'name':
      default:
        return naturalCmp(getName(a), getName(b));
    }
  };
}

function getName(item: FileItem): string {
  return item.href.split('/').filter(Boolean).pop() ?? '';
}

/** Natural string comparison: file2 < file10 */
function naturalCmp(a: string, b: string): number {
  const re = /(\d+)/g;
  const aParts = a.split(re);
  const bParts = b.split(re);
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const ap = aParts[i] ?? '';
    const bp = bParts[i] ?? '';
    const an = parseInt(ap, 10);
    const bn = parseInt(bp, 10);
    if (!isNaN(an) && !isNaN(bn)) {
      if (an !== bn) return an - bn;
    } else {
      const cmp = ap.localeCompare(bp, undefined, { sensitivity: 'base' });
      if (cmp !== 0) return cmp;
    }
  }
  return 0;
}
