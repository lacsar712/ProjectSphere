/**
 * Cloudinary is optional. Local disk storage is the default for offline use.
 * This module only configures the SDK when credentials exist (legacy / optional).
 */
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const hasCredentials = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCredentials) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log(`\x1b[32m[CLOUDINARY]\x1b[0m Configured for cloud: "${process.env.CLOUDINARY_CLOUD_NAME}"`);
} else {
  console.log('\x1b[33m[CLOUDINARY]\x1b[0m Not configured — using local disk uploads');
}

export const isCloudinaryEnabled = () => hasCredentials;
export default cloudinary;
