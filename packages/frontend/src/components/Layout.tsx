import { useItems } from '../hooks/useItems';
import { useStore } from '../store';
import Toolbar from './Toolbar';
import Breadcrumb from './Breadcrumb';
import FileView from './FileView';
import Sidebar from './Sidebar';
import Preview from './Preview';
import Custom from './Custom';
import styles from './Layout.module.css';

export default function Layout() {
  const { items, currentHref, goTo } = useItems();
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const previewItem = useStore((s) => s.previewItem);
  const options = useStore((s) => s.options);

  return (
    <div className={styles.root}>
      <div id="topbar" className={styles.topbar}>
        <Toolbar />
        <Breadcrumb href={currentHref} onNavigate={goTo} />
      </div>

      <Custom href={currentHref} slot="header" />

      <div className={styles.mainrow}>
        {options && !options.view.disableSidebar && sidebarOpen && (
          <Sidebar currentHref={currentHref} onNavigate={goTo} />
        )}
        <main className={styles.content}>
          <FileView items={items} currentHref={currentHref} onNavigate={goTo} />
        </main>
      </div>

      <Custom href={currentHref} slot="footer" />

      {previewItem && <Preview item={previewItem} />}
    </div>
  );
}
