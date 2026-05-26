// ─── File / Folder Item ────────────────────────────────────────────────────

export interface FileItem {
  href: string;
  /** mtime in milliseconds */
  time: number;
  /** file size in bytes; null for folders when not computed */
  size: number | null;
  /** only present on folders */
  managed?: boolean;
  /** only present on folders — whether sub-content has been fetched */
  fetched?: boolean;
  /** URL of generated thumbnail (client-side only, not from server) */
  thumbSrc?: string;
}

// ─── API Request ────────────────────────────────────────────────────────────

export interface GetRequest {
  action: 'get';
  setup?: boolean;
  options?: boolean;
  types?: boolean;
  theme?: boolean;
  langs?: boolean;
  /** { href, what: 1=this folder | 2=sub-folders } */
  items?: { href: string; what: 1 | 2 };
  search?: { href: string; pattern: string; ignorecase: boolean };
  thumbs?: ThumbRequest[];
  /** href to load custom header/footer for */
  custom?: string;
  /** array of locale codes to load */
  l10n?: string[];
}

export interface ThumbRequest {
  type: 'img' | 'mov' | 'doc';
  href: string;
  width: number;
  height: number;
}

export interface LoginRequest {
  action: 'login';
  password: string;
}

export interface LogoutRequest {
  action: 'logout';
}

export type ApiRequest = GetRequest | LoginRequest | LogoutRequest;

// ─── API Response ───────────────────────────────────────────────────────────

export interface SetupInfo {
  version: string;
  /** absolute path to h5ai root on server */
  rootHref: string;
  publicHref: string;
  /** available capabilities */
  hasShellTar: boolean;
  hasShellZip: boolean;
  hasPhpExif: boolean;
  hasPhpGd: boolean;
  hasFfmpeg: boolean;
  hasConvert: boolean;
  hasAvconv: boolean;
  isAdmin: boolean;
}

export interface CustomContent {
  content: string;
  /** 'html' | 'markdown' */
  type: string;
}

export interface CustomResponse {
  header?: CustomContent;
  footer?: CustomContent;
}

export interface GetResponse {
  options?: AppOptions;
  types?: Record<string, string[]>;
  setup?: SetupInfo;
  theme?: Record<string, string>;
  langs?: Record<string, string>;
  items?: FileItem[];
  search?: FileItem[];
  thumbs?: Array<string | null>;
  custom?: CustomResponse;
  l10n?: Record<string, Record<string, string>>;
}

export interface LoginResponse {
  isAdmin: boolean;
}

// ─── Options ────────────────────────────────────────────────────────────────

export interface ViewOptions {
  binaryPrefix: boolean;
  disableSidebar: boolean;
  fallbackMode: boolean;
  fastBrowsing: boolean;
  fonts: string[];
  fontsMono: string[];
  hidden: string[];
  hideFolders: boolean;
  hideIf403: boolean;
  hideParentFolder: boolean;
  maxIconSize: number;
  modes: Array<'details' | 'grid' | 'icons'>;
  modeToggle: boolean | 'next';
  setParentFolderLabels: boolean;
  sizes: number[];
  theme: string;
  unmanaged: string[];
  unmanagedInNewWindow: boolean;
}

export interface ExtensionConfig {
  enabled: boolean;
  [key: string]: unknown;
}

export interface DownloadConfig extends ExtensionConfig {
  type: 'php-tar' | 'shell-tar' | 'shell-zip';
  packageName: string | null;
  alwaysVisible: boolean;
}

export interface FilterConfig extends ExtensionConfig {
  advanced: boolean;
  debounceTime: number;
  ignorecase: boolean;
}

export interface SearchConfig extends ExtensionConfig {
  advanced: boolean;
  debounceTime: number;
  ignorecase: boolean;
}

export interface ThumbnailsConfig extends ExtensionConfig {
  img: boolean;
  mov: boolean;
  doc: boolean;
  delay: number;
  size: number;
  exif: boolean;
  chunksize: number;
}

export interface PreviewConfig extends ExtensionConfig {
  modes: string[];
}

export interface L10nConfig extends ExtensionConfig {
  lang: string;
  useBrowserLang: boolean;
}

export interface InfoConfig extends ExtensionConfig {
  show: boolean;
  qrcode: boolean;
  qrFill: string;
  qrBack: string;
}

export interface AppOptions {
  /** SHA-512 hash of admin password — must not be forwarded to the client */
  passhash?: string;
  view: ViewOptions;
  autorefresh: ExtensionConfig & { interval: number };
  crumb: ExtensionConfig;
  custom: ExtensionConfig & { stopSearchingAtRoot: boolean };
  download: DownloadConfig;
  filter: FilterConfig;
  foldersize: ExtensionConfig & { type: 'php' | 'shell-du' };
  info: InfoConfig;
  l10n: L10nConfig;
  'preview-aud': ExtensionConfig & { autoplay: boolean; types: string[] };
  'preview-img': ExtensionConfig & { size: number | false; types: string[] };
  'preview-txt': ExtensionConfig & { style: number; types: string[] };
  'preview-vid': ExtensionConfig & { autoplay: boolean; types: string[] };
  search: SearchConfig;
  select: ExtensionConfig & { clickndrag: boolean; checkboxes: boolean };
  sort: ExtensionConfig & { column: string; reverse: boolean };
  thumbnails: ThumbnailsConfig;
  tree: ExtensionConfig & { slide: boolean };
  [key: string]: unknown;
}
