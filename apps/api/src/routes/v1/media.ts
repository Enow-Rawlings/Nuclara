import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { requireAdminAuth } from '../../middleware/auth.js'
import { generateUploadSignature } from '../../lib/cloudinary.js'
import { ok } from '../../utils/response.js'

export const mediaRouter = Router()

/**
 * GET /api/v1/media/upload-signature
 * Admin only — returns a server-signed Cloudinary upload signature.
 * The browser uses this to upload directly to Cloudinary without
 * the API secret ever touching the client.
 */
mediaRouter.get(
  '/upload-signature',
  requireAuth,
  requireAdminAuth,
  (req, res, next) => {
    try {
      const folder = (req.query.folder as string) ?? 'products'
      const signature = generateUploadSignature(folder)
      ok(res, signature)
    } catch (err) {
      next(err)
    }
  }
)

import { z } from 'zod'
import { validateBody } from '../../middleware/validate.js'
import { supabase } from '../../lib/supabase.js'
import { cloudinary } from '../../lib/cloudinary.js'
import { ApiError } from '../../utils/ApiError.js'
import { requireRole } from '../../middleware/auth.js'

/**
 * POST /api/v1/media/products/:productId/images
 * After the browser uploads directly to Cloudinary, it calls this endpoint
 * to save the media record in the database.
 */
mediaRouter.post(
  '/products/:productId/images',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'catalogue_manager'),
  validateBody(
    z.object({
      cloudinaryPublicId: z.string().min(1),
      cloudinaryUrl: z.string().url(),
      altText: z.string().max(200).default(''),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const { productId } = req.params
      const { cloudinaryPublicId, cloudinaryUrl, altText, width, height } = req.body as {
        cloudinaryPublicId: string
        cloudinaryUrl: string
        altText: string
        width?: number
        height?: number
      }

      // Verify product exists
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .single()

      if (!product) throw new ApiError(404, 'Product not found')

      // Get current max display_order
      const { data: existing } = await supabase
        .from('product_media')
        .select('display_order')
        .eq('product_id', productId)
        .order('display_order', { ascending: false })
        .limit(1)

      const nextOrder = (existing?.[0]?.display_order ?? -1) + 1

      const { data: media, error } = await supabase
        .from('product_media')
        .insert({
          product_id: productId,
          cloudinary_public_id: cloudinaryPublicId,
          cloudinary_url: cloudinaryUrl,
          alt_text: altText,
          display_order: nextOrder,
          ...(width ? { width } : {}),
          ...(height ? { height } : {}),
        })
        .select('id, cloudinary_url, cloudinary_public_id, alt_text, display_order, width, height')
        .single()

      if (error || !media) throw new ApiError(500, 'Failed to save image record')

      ok(res, media, 201)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * DELETE /api/v1/media/images/:mediaId
 * Delete a product image — removes from Cloudinary and the database.
 */
mediaRouter.delete(
  '/images/:mediaId',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'catalogue_manager'),
  async (req, res, next) => {
    try {
      const { mediaId } = req.params

      // Fetch the record first so we have the Cloudinary public ID
      const { data: media, error: fetchError } = await supabase
        .from('product_media')
        .select('id, cloudinary_public_id')
        .eq('id', mediaId)
        .single()

      if (fetchError || !media) throw new ApiError(404, 'Image not found')

      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(media.cloudinary_public_id)
      } catch {
        // Log but continue — we still remove the DB record
        console.warn(`[media] Failed to delete from Cloudinary: ${media.cloudinary_public_id}`)
      }

      // Delete from database
      await supabase.from('product_media').delete().eq('id', mediaId)

      ok(res, { deleted: true })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * PATCH /api/v1/media/products/:productId/images/reorder
 * Update display_order for a set of images.
 */
mediaRouter.patch(
  '/products/:productId/images/reorder',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'catalogue_manager'),
  validateBody(
    z.object({
      order: z.array(z.object({
        id: z.string().uuid(),
        displayOrder: z.number().int().min(0),
      })),
    })
  ),
  async (req, res, next) => {
    try {
      const { order } = req.body as { order: Array<{ id: string; displayOrder: number }> }

      for (const item of order) {
        await supabase
          .from('product_media')
          .update({ display_order: item.displayOrder })
          .eq('id', item.id)
      }

      ok(res, { reordered: true })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * PATCH /api/v1/media/images/:mediaId/alt
 * Update alt text for a single image.
 */
mediaRouter.patch(
  '/images/:mediaId/alt',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'catalogue_manager'),
  validateBody(z.object({ altText: z.string().max(200) })),
  async (req, res, next) => {
    try {
      const { mediaId } = req.params
      const { altText } = req.body as { altText: string }

      const { error } = await supabase
        .from('product_media')
        .update({ alt_text: altText })
        .eq('id', mediaId)

      if (error) throw new ApiError(404, 'Image not found')
      ok(res, { updated: true })
    } catch (err) {
      next(err)
    }
  }
)
