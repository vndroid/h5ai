import { useEffect } from 'react';
import { apiGet } from '../api/client';
import { useStore } from '../store';

/**
 * Boot hook — loads initial app config from server on mount.
 */
export function useBootstrap() {
  const { setOptions, setTypes, setSetup, setLangs, setTheme, setL10n, options } =
    useStore();

  useEffect(() => {
    if (options) return; // already loaded

    apiGet({
      setup: true,
      options: true,
      types: true,
      theme: true,
      langs: true,
    })
      .then((resp) => {
        if (resp.options) setOptions(resp.options);
        if (resp.types) setTypes(resp.types);
        if (resp.setup) setSetup(resp.setup);
        if (resp.langs) setLangs(resp.langs);
        if (resp.theme) setTheme(resp.theme);

        // Load default locale
        const lang = resp.options?.l10n?.lang ?? 'en';
        return apiGet({ l10n: [lang] });
      })
      .then((resp) => {
        if (resp.l10n) {
          const first = Object.values(resp.l10n)[0];
          if (first) setL10n(first);
        }
      })
      .catch(console.error);
  }, [options, setOptions, setTypes, setSetup, setLangs, setTheme, setL10n]);

  return !!options;
}
