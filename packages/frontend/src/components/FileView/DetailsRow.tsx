import type { FileItem } from '@h5ai/types';
import { useStore } from '../../store';
import FileIcon from '../FileIcon';
import { formatSize, formatDate } from '../../utils/format';
import styles from './DetailsRow.module.css';

interface Props {
  item: FileItem;
  size: number;
  onNavigate: (href: string) => void;
}

export default function DetailsRow({ item, size, onNavigate }: Props) {
  const { selectedHrefs, toggleSelected, setPreviewItem, options, l10n } =
    useStore();

  const isFolder = item.managed !== undefined;
  const isSelected = selectedHrefs.has(item.href);
  const name = decodeURIComponent(item.href.split('/').filter(Boolean).pop() ?? '');

  const handleClick = (e: React.MouseEvent) => {
    if (isFolder) {
      onNavigate(item.href);
    } else {
      if (e.ctrlKey || e.metaKey) {
        toggleSelected(item.href);
      } else {
        setPreviewItem(item);
      }
    }
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleSelected(item.href);
  };

  const binaryPrefix = options?.view.binaryPrefix ?? false;

  return (
    <tr
      className={`${styles.row} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
    >
      <td className={styles.iconCell}>
        {options?.select.checkboxes && (
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={isSelected}
            onChange={handleCheckbox}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <FileIcon href={item.href} isFolder={isFolder} size={size} thumbSrc={item.thumbSrc} />
      </td>
      <td className={styles.name} title={name}>
        <span className={styles.nameText}>{name}</span>
      </td>
      <td className={styles.date}>
        {item.time ? formatDate(item.time, options?.view) : '—'}
      </td>
      <td className={styles.size}>
        {isFolder ? '—' : formatSize(item.size, binaryPrefix)}
      </td>
    </tr>
  );
}
