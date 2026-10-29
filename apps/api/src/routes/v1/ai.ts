import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireAdminAuth } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { ApiError } from '../../utils/ApiError.js'
import { env } from '../../config/env.js'

export const aiRouter = Router()

// ─── Generation type → prompt factory ────────────────────────────────────────

const SYSTEM_PROMPT = `You are a professional copywriter for Nuclara, a research-grade synthetic peptide supplier.
All content must be accurate, neutral, research-context language only.
STRICT RULES:
- No therapeutic claims, no health claims, no human-use language
- No performance, fitness, or bodybuilding language
- No dosage recommendations or instructions
- Always frame use as "for research purposes only" or "laboratory use"
- Keep language professional, factual, and precise
- Do not invent specifications — only use what is provided`

type GenerationType =
  | 'product_short_description'
  | 'product_long_description'
  | 'product_seo_title'
  | 'product_seo_description'
  | 'product_tags'
  | 'category_description'
  | 'category_seo_title'
  | 'category_seo_description'

interface GenerateContext {
  name?: string | undefined
  sku?: string | undefined
  shortDescription?: string | undefined
  longDescription?: string | undefined
  categoryName?: string | undefined
  existing?: string | undefined
}

function buildPrompt(type: GenerationType, ctx: GenerateContext): string {
  const { name = '', sku = '', shortDescription = '', categoryName = '', existing = '' } = ctx

  switch (type) {
    case 'product_short_description':
      return `Write a concise short description (max 120 words) for a research peptide product.
Product name: ${name}
SKU: ${sku}
${existing ? `Existing description to improve: ${existing}` : ''}
Requirements: single paragraph, factual, research-context only, no claims.
Return only the description text, no quotes, no labels.`

    case 'product_long_description':
      return `Write a detailed long description (150–300 words) for a research peptide product.
Product name: ${name}
SKU: ${sku}
Short description: ${shortDescription}
${existing ? `Existing long description to improve: ${existing}` : ''}
Requirements: 2–3 paragraphs, cover what it is, how it is supplied, and its research context.
No therapeutic claims, no dosage, no human-use language. Research use only.
Return only the description text, no quotes, no labels.`

    case 'product_seo_title':
      return `Write an SEO-optimised page title (max 60 characters) for a research peptide product page.
Product name: ${name}
SKU: ${sku}
Short description: ${shortDescription}
Requirements: include the product name, mention research/laboratory context, end with "| Nuclara".
Return only the title string, no quotes, no labels.`

    case 'product_seo_description':
      return `Write an SEO meta description (max 155 characters) for a research peptide product page.
Product name: ${name}
SKU: ${sku}
Short description: ${shortDescription}
Requirements: factual, include key terms naturally, research-context framing, no claims.
Return only the meta description string, no quotes, no labels.`

    case 'product_tags':
      return `Generate 5–8 relevant SEO tags/keywords for a research peptide product.
Product name: ${name}
SKU: ${sku}
Short description: ${shortDescription}
Category: ${categoryName}
Requirements: research-oriented terms, include peptide name variants, research/laboratory terms.
Return as a comma-separated list only, no quotes, no labels, no numbering.`

    case 'category_description':
      return `Write a concise category description (max 100 words) for a research peptide catalogue category.
Category name: ${name}
${existing ? `Existing description to improve: ${existing}` : ''}
Requirements: explains the type of peptides in this category, their general research applications, research-context only.
Return only the description text, no quotes, no labels.`

    case 'category_seo_title':
      return `Write an SEO page title (max 60 characters) for a research peptide category page.
Category name: ${name}
${existing ? `Existing: ${existing}` : ''}
Requirements: include category name, research/laboratory context, end with "| Nuclara".
Return only the title string, no quotes, no labels.`

    case 'category_seo_description':
      return `Write an SEO meta description (max 155 characters) for a research peptide category page.
Category name: ${name}
${shortDescription ? `Category description: ${shortDescription}` : ''}
Requirements: factual, research context, no claims.
Return only the meta description string, no quotes, no labels.`

    default:
      throw new ApiError(400, `Unknown generation type: ${type}`)
  }
}

const generateSchema = z.object({
  type: z.enum([
    'product_short_description',
    'product_long_description',
    'product_seo_title',
    'product_seo_description',
    'product_tags',
    'category_description',
    'category_seo_title',
    'category_seo_description',
  ]),
  context: z.object({
    name: z.string().max(300).optional(),
    sku: z.string().max(100).optional(),
    shortDescription: z.string().max(500).optional(),
    longDescription: z.string().max(2000).optional(),
    categoryName: z.string().max(200).optional(),
    existing: z.string().max(1000).optional(),
  }),
})

/**
 * POST /api/v1/ai/generate
 * Admin only — generate SEO-optimised content for a product or category
 * using the Groq API (server-side only, key never reaches the client).
 */
aiRouter.post(
  '/generate',
  requireAuth,
  requireAdminAuth,
  validateBody(generateSchema),
  async (req, res, next) => {
    try {
      if (!env.GROQ_API_KEY) {
        throw new ApiError(503, 'AI generation is not configured. Add GROQ_API_KEY to the server environment.')
      }

      const { type, context } = req.body as z.infer<typeof generateSchema>
      const prompt = buildPrompt(type as GenerationType, context)

      // Lazy-load Groq to avoid import errors when key is not set
      const { default: Groq } = await import('groq-sdk')
      const groq = new Groq({ apiKey: env.GROQ_API_KEY })

      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 512,
      })

      const generated = completion.choices[0]?.message?.content?.trim() ?? ''

      if (!generated) throw new ApiError(500, 'AI returned an empty response. Please try again.')

      ok(res, { generated })
    } catch (err) {
      // Pass Groq/network errors through as 502
      if ((err as { status?: number }).status && !(err instanceof ApiError)) {
        return next(new ApiError(502, `AI service error: ${(err as Error).message}`))
      }
      next(err)
    }
  }
)
