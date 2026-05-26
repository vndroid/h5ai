import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import styles from './Custom.module.css';

interface Props {
  href: string;
  slot: 'header' | 'footer';
}

export default function Custom({ href, slot }: Props) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    apiGet({ custom: href })
      .then((resp) => {
        const content = resp.custom?.[slot];
        setHtml(content?.content ?? null);
      })
      .catch(() => setHtml(null));
  }, [href, slot]);

  if (!html) return null;

  return (
    <div
      className={styles.custom}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
