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
 *
 * IMPORTANT: every parameter included in paramsToSign MUST also be sent
 * by the client in the Cloudinary FormData. Cloudinary verifies the
 * signature against only the parameters it receives, so any mismatch
 * (extra or missing params) causes an "Invalid Signature" error.
 */
export function generateUploadSignature(folder: string) {
  const timestamp = Math.round(Date.now() / 1000)
  const allowedFormats = 'jpg,jpeg,png,webp'

  // Only sign parameters the client will also send to Cloudinary.
  // (max_bytes is not a valid Cloudinary upload API parameter — file-size
  // limits are enforced client-side and via upload presets.)
  const paramsToSign = {
    timestamp,
    folder: `nuclara/${folder}`,
    allowed_formats: allowedFormats,
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET)

  return {
    signature,
    timestamp,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    folder: paramsToSign.folder,
    allowedFormats,
  }
}
