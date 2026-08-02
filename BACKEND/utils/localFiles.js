import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_ROOT = path.resolve(__dirname, '..', 'uploads');

export function ensureUploadDirs() {
  const dirs = [
    UPLOAD_ROOT,
    path.join(UPLOAD_ROOT, 'profiles'),
    path.join(UPLOAD_ROOT, 'documents'),
    path.join(UPLOAD_ROOT, 'presentations'),
    path.join(UPLOAD_ROOT, 'code'),
    path.join(UPLOAD_ROOT, 'misc'),
  ];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Resolve multer file → public URL stored in DB (served at /uploads/*). */
export function toPublicUrl(file) {
  if (!file) return '';
  const relative = path.relative(UPLOAD_ROOT, file.path).replace(/\\/g, '/');
  return `/uploads/${relative}`;
}

/** publicId is relative path under uploads/, e.g. profiles/123_a.png */
export function deleteLocalFile(publicId) {
  if (!publicId) return;
  // Ignore legacy Cloudinary-style IDs that aren't local paths
  if (publicId.includes('://') || publicId.startsWith('http')) return;
  const target = path.resolve(UPLOAD_ROOT, publicId);
  if (!target.startsWith(UPLOAD_ROOT)) return;
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
}

export function pickUploadSubdir(file) {
  const name = (file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();
  if (file.fieldname === 'profilePhoto' || mime.includes('image')) return 'profiles';
  if (mime.includes('pdf') || name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.doc')) return 'documents';
  if (mime.includes('presentation') || name.endsWith('.ppt') || name.endsWith('.pptx')) return 'presentations';
  if (mime.includes('zip') || mime.includes('tar') || name.endsWith('.zip') || name.endsWith('.rar')) return 'code';
  return 'misc';
}
