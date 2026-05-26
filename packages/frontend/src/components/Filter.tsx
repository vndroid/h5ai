import { useStore } from '../store';
import styles from './Filter.module.css';

export default function FilterBar() {
  const { filterText, setFilterText, l10n } = useStore();

  return (
    <div className={styles.wrap}>
      <img src="/images/ui/filter.svg" alt="" width={24} height={24} className={styles.icon} />
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
