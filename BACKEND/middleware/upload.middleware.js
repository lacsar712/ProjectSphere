import multer from 'multer';
import path from 'path';
import {
  UPLOAD_ROOT,
  ensureUploadDirs,
  pickUploadSubdir,
} from '../utils/localFiles.js';

ensureUploadDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = pickUploadSubdir(file);
    cb(null, path.join(UPLOAD_ROOT, subdir));
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});
