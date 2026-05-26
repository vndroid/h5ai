import type { FileItem } from '@h5ai/types';
import { useStore } from '../../store';
import { useSortedItems } from '../../hooks/useFilters';
import DetailsRow from './DetailsRow';
import GridCard from './GridCard';
import FilterBar from '../Filter';
import SearchBar from '../Search';
import styles from './FileView.module.css';

interface Props {
  items: FileItem[];
  currentHref: string;
  onNavigate: (href: string) => void;
}

export default function FileView({ items, currentHref, onNavigate }: Props) {
  const viewMode = useStore((s) => s.viewMode);
  const viewSize = useStore((s) => s.viewSize);
  const sortColumn = useStore((s) => s.sortColumn);
  const sortReverse = useStore((s) => s.sortReverse);
  const toggleSort = useStore((s) => s.toggleSort);
  const searchResults = useStore((s) => s.searchResults);
  const searchActive = useStore((s) => s.searchActive);
  const l10n = useStore((s) => s.l10n);
  const options = useStore((s) => s.options);

  const displayItems = searchActive && searchResults ? searchResults : items;
  const sorted = useSortedItems(displayItems);

  const SortHeader = ({
    col,
    label,
    align,
    width,
  }: {
    col: 'name' | 'time' | 'size';
    label: string;
    align?: 'right';
    width?: number;
  }) => (
    <th
      className={[styles.th, sortColumn === col ? styles.sorted : '', align === 'right' ? styles.right : ''].join(' ')}
      style={width ? { width } : undefined}
      onClick={() => toggleSort(col)}
      aria-sort={sortColumn === col ? (sortReverse ? 'descending' : 'ascending') : 'none'}
    >
      {label}
      {sortColumn === col && <span className={styles.sortArrow}>{sortReverse ? ' ↓' : ' ↑'}</span>}
    </th>
  );

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        {options?.filter.enabled && <FilterBar />}
        {options?.search.enabled && <SearchBar href={currentHref} />}
      </div>

      {viewMode === 'details' && (
        <table className={styles.table} style={{ '--size': `${viewSize}px` } as React.CSSProperties}>
          <thead>
            <tr>
              <th className={styles.thIcon} />
              <SortHeader col="name" label={l10n['name'] ?? 'Name'} />
              <SortHeader col="time" label={l10n['lastModified'] ?? 'Last modified'} align="right" width={150} />
              <SortHeader col="size" label={l10n['size'] ?? 'Size'} align="right" width={72} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <DetailsRow
                key={item.href}
                item={item}
                size={viewSize}
                onNavigate={onNavigate}
              />
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.empty}>
                  {l10n['empty'] ?? 'No files'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {(viewMode === 'grid' || viewMode === 'icons') && (
        <div
          className={`${styles.grid} ${viewMode === 'icons' ? styles.icons : ''}`}
          style={{ '--size': `${viewSize}px` } as React.CSSProperties}
        >
          {sorted.map((item) => (
            <GridCard
              key={item.href}
              item={item}
              size={viewSize}
              mode={viewMode}
              onNavigate={onNavigate}
            />
          ))}
          {sorted.length === 0 && (
            <div className={styles.empty}>{l10n['empty'] ?? 'No files'}</div>
          )}
        </div>
      )}
    </div>
  );
}
