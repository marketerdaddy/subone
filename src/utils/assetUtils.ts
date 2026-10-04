/**
 * Asset URL Resolver & Fallbacks for Production & GitHub Pages
 */

export const AVATAR_FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2338bdf8"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="100" height="100" rx="20" fill="url(%23bg)"/><circle cx="50" cy="38" r="18" fill="url(%23accent)"/><path d="M22 84 C22 64 36 58 50 58 C64 58 78 64 78 84 Z" fill="url(%23accent)"/><circle cx="50" cy="38" r="8" fill="%2303050a"/></svg>`;

export const BANNER_FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400"><defs><linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%2303050a"/></linearGradient><linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%2306b6d4"/><stop offset="50%" stop-color="%23ec4899"/><stop offset="100%" stop-color="%238b5cf6"/></linearGradient></defs><rect width="800" height="400" fill="url(%23sky)"/><line x1="0" y1="260" x2="800" y2="260" stroke="url(%23glow)" stroke-width="4"/><path d="M0 260 L400 180 L800 260" stroke="%23ec4899" stroke-width="1.5" fill="none" opacity="0.4"/><circle cx="400" cy="180" r="60" fill="url(%23glow)" opacity="0.3"/></svg>`;

export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return getAssetUrl('images/char_zayn.jpg');

  // If already a data URI, leave it as is
  if (path.startsWith('data:')) {
    return path;
  }

  // If external unsplash image from older state, fallback to local char_zayn.jpg
  if (path.includes('images.unsplash.com')) {
    return getAssetUrl('images/char_zayn.jpg');
  }

  // If other external URL, keep as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Strip leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Resolve relative to Vite base
  const base = import.meta.env.BASE_URL || './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${cleanPath}`;
}
