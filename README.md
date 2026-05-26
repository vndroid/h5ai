# h5ai-next

Modern HTTP directory index — React + Fastify rewrite of [h5ai](https://larsjung.de/h5ai/).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Fastify 4 + TypeScript |
| Shared types | `@h5ai/types` (local package) |
| State | Zustand |
| Icons | Lucide React |
| Thumbnails | sharp + ffmpeg |
| Archives | archiver (tar/zip) |

## Project Structure

```
packages/
  types/      # Shared TypeScript types (API request/response, options)
  backend/    # Fastify server — file listing, thumbnails, auth, search, download
  frontend/   # React + Vite SPA — file browser UI
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure

Edit `packages/backend/conf/options.json` to set:
- `passhash` — SHA-512 of your admin password (default: empty string)
- `view.hidden` — patterns to hide files
- Enable/disable extensions

Set environment variables:
```bash
ROOT_PATH=/path/to/serve      # directory to browse (default: cwd)
PORT=3000                      # backend port (default: 3000)
SESSION_SECRET=changeme        # session signing secret
```

### 3. Run in development

```bash
npm run dev
```

- Backend: http://localhost:3000
- Frontend dev server: http://localhost:5173 (proxies /api → backend)

### 4. Build for production

```bash
npm run build
```

Serve `packages/frontend/dist/` as static files and run the backend.

## Features

- ✅ File/folder listing (details, grid, icons view modes)
- ✅ Sort by name, date, size
- ✅ Real-time filter
- ✅ File search (regex-capable)
- ✅ Multi-select + packaged download (tar.gz / zip)
- ✅ Thumbnail generation (images via sharp, videos via ffmpeg)
- ✅ File preview (image, video, audio, text/code)
- ✅ Folder tree sidebar
- ✅ Breadcrumb navigation
- ✅ Custom header/footer (HTML or Markdown per-directory)
- ✅ Localization (32 languages)
- ✅ Password authentication
- ✅ Dark mode (system preference)
- ✅ Responsive layout
