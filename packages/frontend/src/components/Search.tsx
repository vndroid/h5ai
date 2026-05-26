import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store';
import { apiGet } from '../api/client';
import type { FileItem } from '@h5ai/types';
import styles from './Search.module.css';

interface Props {
  href: string;
}

export default function SearchBar({ href }: Props) {
  const { setSearchResults, setSearchActive, l10n, options } = useStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const debounceMs = options?.search.debounceTime ?? 200;
  const ignorecase = options?.search.ignorecase ?? true;

  const runSearch = useCallback(
    async (pattern: string) => {
      if (!pattern.trim()) {
        setSearchActive(false);
        setSearchResults(null);
        return;
      }
      setLoading(true);
      try {
        const resp = await apiGet({ search: { href, pattern, ignorecase } });
        setSearchResults(resp.search ?? []);
        setSearchActive(true);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [href, ignorecase, setSearchActive, setSearchResults],
  );

  useEffect(() => {
    const id = setTimeout(() => void runSearch(query), debounceMs);
    return () => clearTimeout(id);
  }, [query, debounceMs, runSearch]);

  const clear = () => {
    setQuery('');
    setSearchActive(false);
    setSearchResults(null);
  };

  return (
    <div className={styles.wrap}>
      <img src="/images/ui/search.svg" alt="" width={24} height={24} className={styles.icon} />
      <input
        className={styles.input}
        type="text"
        placeholder={l10n['search'] ?? 'Search…'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <span className={styles.spinner} />}
      {query && (
        <button className={styles.clear} onClick={clear} type="button">
          <img src="/images/ui/back.svg" alt="clear" width={16} height={16} />
        </button>
      )}
    </div>
  );
}
