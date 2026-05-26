import { create } from 'zustand';
import type { AppOptions, FileItem, SetupInfo } from '@h5ai/types';

export type ViewMode = 'details' | 'grid' | 'icons';
export type SortColumn = 'name' | 'time' | 'size' | 'type';

interface AppState {
  // ── Server data ──────────────────────────────────────────────────────────
  options: AppOptions | null;
  types: Record<string, string[]> | null;
  setup: SetupInfo | null;
  langs: Record<string, string>;
  l10n: Record<string, string>;
  theme: Record<string, string>;

  // ── Navigation ───────────────────────────────────────────────────────────
  currentHref: string;
  items: FileItem[];
  itemCache: Record<string, FileItem[]>;

  // ── View ─────────────────────────────────────────────────────────────────
  viewMode: ViewMode;
  viewSize: number;

  // ── Sort ─────────────────────────────────────────────────────────────────
  sortColumn: SortColumn;
  sortReverse: boolean;

  // ── Selection ────────────────────────────────────────────────────────────
  selectedHrefs: Set<string>;

  // ── Filter ───────────────────────────────────────────────────────────────
  filterText: string;

  // ── Search ───────────────────────────────────────────────────────────────
  searchResults: FileItem[] | null;
  searchActive: boolean;

  // ── UI State ─────────────────────────────────────────────────────────────
  sidebarOpen: boolean;
  previewItem: FileItem | null;
  loading: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────
  setOptions: (o: AppOptions) => void;
  setTypes: (t: Record<string, string[]>) => void;
  setSetup: (s: SetupInfo) => void;
  setLangs: (l: Record<string, string>) => void;
  setL10n: (l: Record<string, string>) => void;
  setTheme: (t: Record<string, string>) => void;

  navigate: (href: string) => void;
  setItems: (href: string, items: FileItem[]) => void;

  setViewMode: (m: ViewMode) => void;
  setViewSize: (s: number) => void;

  setSortColumn: (c: SortColumn) => void;
  setSortReverse: (r: boolean) => void;
  toggleSort: (c: SortColumn) => void;

  setSelectedHrefs: (hrefs: Set<string>) => void;
  toggleSelected: (href: string) => void;
  clearSelection: () => void;

  setFilterText: (t: string) => void;
  setSearchResults: (r: FileItem[] | null) => void;
  setSearchActive: (a: boolean) => void;

  setSidebarOpen: (o: boolean) => void;
  setPreviewItem: (item: FileItem | null) => void;
  setLoading: (l: boolean) => void;
}

const stored = (key: string, fallback: string) =>
  localStorage.getItem(key) ?? fallback;

export const useStore = create<AppState>((set, get) => ({
  options: null,
  types: null,
  setup: null,
  langs: {},
  l10n: {},
  theme: {},

  currentHref: window.location.pathname,
  items: [],
  itemCache: {},

  viewMode: (stored('h5ai:viewMode', 'details')) as ViewMode,
  viewSize: parseInt(stored('h5ai:viewSize', '40'), 10),

  sortColumn: 'name',
  sortReverse: false,

  selectedHrefs: new Set(),
  filterText: '',
  searchResults: null,
  searchActive: false,
  sidebarOpen: false,
  previewItem: null,
  loading: false,

  setOptions: (options) => set({ options }),
  setTypes: (types) => set({ types }),
  setSetup: (setup) => set({ setup }),
  setLangs: (langs) => set({ langs }),
  setL10n: (l10n) => set({ l10n }),
  setTheme: (theme) => set({ theme }),

  navigate: (href) => set({ currentHref: href, selectedHrefs: new Set(), filterText: '' }),

  setItems: (href, items) =>
    set((s) => ({
      items,
      itemCache: { ...s.itemCache, [href]: items },
    })),

  setViewMode: (viewMode) => {
    localStorage.setItem('h5ai:viewMode', viewMode);
    set({ viewMode });
  },
  setViewSize: (viewSize) => {
    localStorage.setItem('h5ai:viewSize', String(viewSize));
    set({ viewSize });
  },

  setSortColumn: (sortColumn) => set({ sortColumn }),
  setSortReverse: (sortReverse) => set({ sortReverse }),
  toggleSort: (column) => {
    const { sortColumn, sortReverse } = get();
    if (sortColumn === column) {
      set({ sortReverse: !sortReverse });
    } else {
      set({ sortColumn: column, sortReverse: false });
    }
  },

  setSelectedHrefs: (selectedHrefs) => set({ selectedHrefs }),
  toggleSelected: (href) => {
    const next = new Set(get().selectedHrefs);
    if (next.has(href)) next.delete(href);
    else next.add(href);
    set({ selectedHrefs: next });
  },
  clearSelection: () => set({ selectedHrefs: new Set() }),

  setFilterText: (filterText) => set({ filterText }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearchActive: (searchActive) => set({ searchActive }),

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setPreviewItem: (previewItem) => set({ previewItem }),
  setLoading: (loading) => set({ loading }),
}));
