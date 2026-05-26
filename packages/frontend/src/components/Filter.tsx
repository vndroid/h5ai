import { useStore } from '../store';
import { Filter as FilterIcon } from 'lucide-react';
import styles from './Filter.module.css';

export default function FilterBar() {
  const { filterText, setFilterText, l10n } = useStore();

  return (
    <div className={styles.wrap}>
      <FilterIcon size={14} className={styles.icon} />
      <input
        className={styles.input}
        type="text"
        placeholder={l10n['filter'] ?? 'Filter…'}
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />
    </div>
  );
}
