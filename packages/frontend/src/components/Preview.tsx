import type { FileItem } from '@h5ai/types';
import { useStore } from '../store';
import { X } from 'lucide-react';
import styles from './Preview.module.css';

interface Props {
  item: FileItem;
}

export default function Preview({ item }: Props) {
  const { setPreviewItem, options, types } = useStore();
  const close = () => setPreviewItem(null);

  const href = item.href;
  const name = decodeURIComponent(href.split('/').filter(Boolean).pop() ?? '');

  const fileType = getFileType(href, types);
  const previewType = detectPreviewType(fileType, options);

  return (
    <div className={styles.overlay} onClick={close}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>{name}</span>
          <button className={styles.close} onClick={close}>
            <X size={18} />
          </button>
        </div>
        <div className={styles.body}>
          {previewType === 'img' && (
            <img src={href} alt={name} className={styles.img} />
          )}
          {previewType === 'vid' && (
            <video
              src={href}
              controls
              autoPlay={options?.['preview-vid']?.autoplay}
              className={styles.media}
            />
          )}
          {previewType === 'aud' && (
            <audio
              src={href}
              controls
              autoPlay={options?.['preview-aud']?.autoplay}
              className={styles.audio}
            />
          )}
          {previewType === 'txt' && <TextPreview href={href} />}
          {previewType === null && (
            <div className={styles.noPreview}>
              No preview available for this file type.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TextPreview({ href }: { href: string }) {
  const [text, setText] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(href)
      .then((r) => r.text())
      .then(setText)
      .catch(() => setText(null));
  }, [href]);

  if (text === null) return <div className={styles.loading}>Loading…</div>;
  return <pre className={styles.code}>{text}</pre>;
}

import React from 'react';

function getFileType(href: string, types: Record<string, string[]> | null): string {
  if (!types) return '';
  const name = href.split('/').filter(Boolean).pop() ?? '';
  for (const [key, patterns] of Object.entries(types)) {
    for (const pattern of patterns) {
      const re = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$', 'i');
      if (re.test(name)) return key;
    }
  }
  return '';
}

function detectPreviewType(
  fileType: string,
  options: ReturnType<typeof useStore.getState>['options'],
): 'img' | 'vid' | 'aud' | 'txt' | null {
  if (!options) return null;

  const previewImg = options['preview-img'];
  if (previewImg.enabled && previewImg.types.some((t: string) => fileType.startsWith(t) || fileType === t))
    return 'img';

  const previewVid = options['preview-vid'];
  if (previewVid.enabled && previewVid.types.some((t: string) => fileType.startsWith(t) || fileType === t))
    return 'vid';

  const previewAud = options['preview-aud'];
  if (previewAud.enabled && previewAud.types.some((t: string) => fileType.startsWith(t) || fileType === t))
    return 'aud';

  const previewTxt = options['preview-txt'];
  if (previewTxt.enabled && previewTxt.types.some((t: string) => fileType.startsWith(t) || fileType === t))
    return 'txt';

  return null;
}
