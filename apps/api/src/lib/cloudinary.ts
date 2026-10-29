import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env.js'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

/**
 * Generate a server-signed upload signature.
 * The browser sends this signature with its upload request —
 * the API secret is never sent to or stored on the client.
 */
export function generateUploadSignature(folder: string) {
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = {
    timestamp,
    folder: `nuclara/${folder}`,
    allowed_formats: 'jpg,jpeg,png,webp',
    max_bytes: 5 * 1024 * 1024, // 5 MB
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET)

  return {
    signature,
    timestamp,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    folder: paramsToSign.folder,
  }
}
