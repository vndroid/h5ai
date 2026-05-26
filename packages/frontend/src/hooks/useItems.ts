import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../api/client';
import { useStore } from '../store';

/**
 * Manages directory navigation and item fetching.
 * Reads currentHref from the store and syncs with the browser URL.
 */
export function useItems() {
  const currentHref = useStore((s) => s.currentHref);
  const items = useStore((s) => s.items);
  const options = useStore((s) => s.options);
  // Use a ref to read itemCache inside callbacks without adding it to deps.
  // This prevents the infinite re-render loop caused by setItems → new itemCache
  // reference → loadHref recreated → useEffect re-fires → repeat.
  const itemCacheRef = useRef(useStore.getState().itemCache);
  useEffect(() => {
    return useStore.subscribe((s) => { itemCacheRef.current = s.itemCache; });
  }, []);

  const { navigate, setItems, setLoading } = useStore.getState();
  const browserNavigate = useNavigate();

  const loadHref = useCallback(
    async (href: string) => {
      const cached = itemCacheRef.current[href];
      if (cached) {
        useStore.getState().setItems(href, cached);
        return;
      }
      setLoading(true);
      try {
        const resp = await apiGet({ items: { href, what: 1 } });
        if (resp.items) useStore.getState().setItems(href, resp.items);
      } catch (e) {
        console.error('[useItems] load error', e);
      } finally {
        setLoading(false);
      }
    },
    [setLoading],
  );

  // Navigate to a new href — update store + browser history
  const goTo = useCallback(
    (href: string) => {
      navigate(href);
      browserNavigate(href);
      void loadHref(href);
    },
    [navigate, browserNavigate, loadHref],
  );

  // Load items when currentHref changes (only depends on stable values)
  useEffect(() => {
    if (!options) return;
    void loadHref(currentHref);
  }, [currentHref, options, loadHref]);

  return { items, currentHref, goTo };
}
