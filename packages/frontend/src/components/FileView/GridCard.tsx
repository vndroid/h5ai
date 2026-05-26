import type { FileItem } from '@h5ai/types';
import { useStore } from '../../store';
import FileIcon from '../FileIcon';
import { formatSize } from '../../utils/format';
import styles from './GridCard.module.css';

interface Props {
  item: FileItem;
  size: number;
  mode: 'grid' | 'icons';
  onNavigate: (href: string) => void;
}

export default function GridCard({ item, size, mode, onNavigate }: Props) {
  const { selectedHrefs, toggleSelected, setPreviewItem } = useStore();
  const isFolder = item.managed !== undefined;
  const isSelected = selectedHrefs.has(item.href);
  const name = decodeURIComponent(item.href.split('/').filter(Boolean).pop() ?? '');

  const iconSize = mode === 'icons' ? Math.max(size, 60) : size;

  const handleClick = (e: React.MouseEvent) => {
    if (isFolder) {
      onNavigate(item.href);
    } else if (e.ctrlKey || e.metaKey) {
      toggleSelected(item.href);
    } else {
      setPreviewItem(item);
    }
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''} ${mode === 'icons' ? styles.iconMode : ''}`}
      style={{ '--icon-size': `${iconSize}px` } as React.CSSProperties}
      onClick={handleClick}
      title={name}
    >
      <div className={styles.iconWrap}>
        <FileIcon href={item.href} isFolder={isFolder} size={iconSize} thumbSrc={item.thumbSrc} />
      </div>
      <span className={styles.label}>{name}</span>
    </div>
  );
}
