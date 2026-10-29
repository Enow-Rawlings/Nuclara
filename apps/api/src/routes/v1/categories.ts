import { Router } from 'express'
import { ok } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'

export const categoriesRouter = Router()

/** GET /api/v1/categories — public visible categories */
categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url, parent_id')
      .eq('is_visible', true)
      .order('name')

    if (error) throw new ApiError(500, 'Failed to fetch categories')
    ok(res, data ?? [])
  } catch (err) {
    next(err)
  }
})

/** GET /api/v1/categories/:slug */
categoriesRouter.get('/:slug', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url, parent_id')
      .eq('slug', req.params.slug)
      .eq('is_visible', true)
      .single()

    if (error || !data) throw new ApiError(404, 'Category not found')
    ok(res, data)
  } catch (err) {
    next(err)
  }
})
