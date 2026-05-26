import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../api/client';
import { useStore } from '../store';

/**
 * Manages directory navigation and item fetching.
 * Reads currentHref from the store and syncs with the browser URL.
 */
export function useItems() {
  const {
    currentHref,
    items,
    itemCache,
    navigate,
    setItems,
    setLoading,
    options,
  } = useStore();

  const browserNavigate = useNavigate();

  const loadHref = useCallback(
    async (href: string) => {
      // Serve from cache if available
      if (itemCache[href]) {
        setItems(href, itemCache[href]);
        return;
      }
      setLoading(true);
      try {
        const resp = await apiGet({ items: { href, what: 1 } });
        if (resp.items) setItems(href, resp.items);
      } catch (e) {
        console.error('[useItems] load error', e);
      } finally {
        setLoading(false);
      }
    },
    [itemCache, setItems, setLoading],
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

  // Load items when currentHref changes
  useEffect(() => {
    if (!options) return;
    void loadHref(currentHref);
  }, [currentHref, options, loadHref]);

  return { items, currentHref, goTo };
}
