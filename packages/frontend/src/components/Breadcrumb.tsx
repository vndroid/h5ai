import { ChevronRight, Home } from 'lucide-react';
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
      <button className={styles.segment} onClick={() => onNavigate('/')}>
        <Home size={14} />
      </button>
      {crumbs.map((c, i) => (
        <span key={c.href} className={styles.item}>
          <ChevronRight size={12} className={styles.sep} />
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
