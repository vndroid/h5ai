import { useFileType } from '../hooks/useFilters';

interface Props {
  href: string;
  isFolder: boolean;
  size: number;
  thumbSrc?: string;
  isParent?: boolean;
}

/** Map type-key prefix → theme/default SVG filename */
const TYPE_SVG: Record<string, string> = {
  img: 'img',
  aud: 'aud',
  vid: 'vid',
  txt: 'txt',
  ar:  'ar',
  bin: 'bin',
};

function getTypeSvg(typeKey: string): string {
  for (const [prefix, name] of Object.entries(TYPE_SVG)) {
    if (typeKey.startsWith(prefix)) return name;
  }
  return 'file';
}

const BASE = '/images/themes/default';

export default function FileIcon({ href, isFolder, size, thumbSrc, isParent }: Props) {
  const typeKey = useFileType(href);

  if (thumbSrc) {
    return (
      <img
        src={thumbSrc}
        alt=""
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: 2 }}
        loading="lazy"
      />
    );
  }

  if (isFolder) {
    const src = isParent
      ? `${BASE}/folder-parent.svg`
      : `${BASE}/folder.svg`;
    return <img src={src} alt="" width={size} height={size} style={{ display: 'block' }} />;
  }

  const src = `${BASE}/${getTypeSvg(typeKey)}.svg`;
  return <img src={src} alt="" width={size} height={size} style={{ display: 'block' }} />;
}

