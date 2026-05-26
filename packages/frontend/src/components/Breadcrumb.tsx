import styles from './Breadcrumb.module.css';

interface Props {
  href: string;
  onNavigate: (href: string) => void;
}

export default function Breadcrumb({ href, onNavigate }: Props) {
  const parts = href.split('/').filter(Boolean);

  const crumbs = parts.map((part, i) => ({
    label: decodeURIComponent(part),
    href: '/' + parts.slice(0, i + 1).join('/') + '/',
  }));

  return (
    <nav className={styles.crumb} aria-label="breadcrumb">
      <span className={styles.item}>
        <button className={styles.segment} onClick={() => onNavigate('/')}>
          <img src="/images/themes/default/folder.svg" alt="root" width={16} height={16} />
        </button>
      </span>
      {crumbs.map((c, i) => (
        <span key={c.href} className={styles.item}>
          <img src="/images/ui/crumb.svg" alt="" width={20} height={20} className={styles.sep} />
          {i === crumbs.length - 1 ? (
            <span className={styles.current}>{c.label}</span>
          ) : (
            <button className={styles.segment} onClick={() => onNavigate(c.href)}>
              {c.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  );
}
