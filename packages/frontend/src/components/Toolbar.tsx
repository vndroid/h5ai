import {
  LayoutList,
  Grid2x2,
  Images,
  Download,
  PanelLeft,
  Search,
  Filter,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../store';
import { apiLogout } from '../api/client';
import { downloadArchive } from '../api/client';
import type { ViewMode } from '../store';
import styles from './Toolbar.module.css';

export default function Toolbar() {
  const {
    viewMode, setViewMode,
    viewSize, setViewSize,
    sidebarOpen, setSidebarOpen,
    selectedHrefs, currentHref,
    options, setup, l10n,
  } = useStore();

  const modes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'details', icon: <LayoutList size={16} />, label: l10n['details'] ?? 'Details' },
    { mode: 'grid', icon: <Grid2x2 size={16} />, label: l10n['grid'] ?? 'Grid' },
    { mode: 'icons', icon: <Images size={16} />, label: l10n['icons'] ?? 'Icons' },
  ];

  const availableModes = options?.view.modes ?? ['details', 'grid', 'icons'];
  const sizes = options?.view.sizes ?? [20, 40, 60, 80, 100];

  const handleDownload = () => {
    const hrefs = [...selectedHrefs];
    if (hrefs.length === 0 && !options?.download.alwaysVisible) return;
    const downloadHrefs = hrefs.length > 0 ? hrefs : [currentHref];
    const type = options?.download.type ?? 'shell-tar';
    const folderName =
      options?.download.packageName ??
      currentHref.split('/').filter(Boolean).pop() ??
      'download';
    const ext = type.includes('zip') ? '.zip' : '.tar.gz';
    downloadArchive({
      as: folderName + ext,
      type,
      baseHref: currentHref,
      hrefs: downloadHrefs,
    });
  };

  const handleLogout = async () => {
    await apiLogout();
    window.location.reload();
  };

  const showDownload =
    options?.download.enabled &&
    (options?.download.alwaysVisible || selectedHrefs.size > 0);

  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        {options && !options.view.disableSidebar && (
          <button
            className={`${styles.btn} ${sidebarOpen ? styles.active : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle sidebar"
          >
            <PanelLeft size={16} />
          </button>
        )}
      </div>

      <div className={styles.center} />

      <div className={styles.right}>
        {showDownload && (
          <button className={styles.btn} onClick={handleDownload} title={l10n['download'] ?? 'Download'}>
            <Download size={16} />
            {selectedHrefs.size > 0 && (
              <span className={styles.badge}>{selectedHrefs.size}</span>
            )}
          </button>
        )}

        {/* View mode toggles */}
        {availableModes.length > 1 &&
          modes
            .filter((m) => availableModes.includes(m.mode))
            .map((m) => (
              <button
                key={m.mode}
                className={`${styles.btn} ${viewMode === m.mode ? styles.active : ''}`}
                onClick={() => setViewMode(m.mode)}
                title={m.label}
              >
                {m.icon}
              </button>
            ))}

        {/* View size slider */}
        <input
          type="range"
          className={styles.sizeSlider}
          min={sizes[0]}
          max={sizes[sizes.length - 1]}
          step={sizes[1] - sizes[0]}
          value={viewSize}
          onChange={(e) => setViewSize(Number(e.target.value))}
          title={`Icon size: ${viewSize}px`}
        />

        {setup?.isAdmin ? (
          <button className={styles.btn} onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        ) : (
          <a href="/login" className={styles.btn} title="Login">
            <LogIn size={16} />
          </a>
        )}
      </div>
    </div>
  );
}
