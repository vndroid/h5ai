import type { LucideProps } from 'lucide-react';
import { Folder, File, FileText, Image, Music, Video, Archive, Code } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import { useFileType } from '../hooks/useFilters';

interface Props {
  href: string;
  isFolder: boolean;
  size: number;
  thumbSrc?: string;
}

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

const TYPE_ICONS: Record<string, LucideIcon> = {
  'txt': FileText,
  'img': Image,
  'aud': Music,
  'vid': Video,
  'ar': Archive,
  'code': Code,
};

function getIconComponent(typeKey: string): LucideIcon {
  for (const [prefix, Icon] of Object.entries(TYPE_ICONS)) {
    if (typeKey.startsWith(prefix)) return Icon;
  }
  return File;
}

export default function FileIcon({ href, isFolder, size, thumbSrc }: Props) {
  const typeKey = useFileType(href);

  if (thumbSrc) {
    return (
      <img
        src={thumbSrc}
        alt=""
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: 3 }}
        loading="lazy"
      />
    );
  }

  if (isFolder) {
    return <Folder size={size} color="var(--folder-color)" fill="var(--folder-fill)" />;
  }

  const Icon = getIconComponent(typeKey);
  return <Icon size={size} />;
}
