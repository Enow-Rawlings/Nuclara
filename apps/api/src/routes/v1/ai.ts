import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireAdminAuth } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { ApiError } from '../../utils/ApiError.js'
import { env } from '../../config/env.js'

export const aiRouter = Router()

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
  | 'blog_excerpt'
  | 'blog_content'

interface GenerateContext {
  name?: string | undefined
  sku?: string | undefined
  shortDescription?: string | undefined
  longDescription?: string | undefined
  categoryName?: string | undefined
  existing?: string | undefined
}

function buildPrompt(type: GenerationType, ctx: GenerateContext): string {
  const name = ctx.name ?? ''
  const sku = ctx.sku ?? ''
  const shortDescription = ctx.shortDescription ?? ''
  const categoryName = ctx.categoryName ?? ''
  const existing = ctx.existing ?? ''

  switch (type) {
    case 'product_short_description':
      return [
        'Write a concise short description (max 120 words) for a research peptide product.',
        `Product name: ${name}`,
        `SKU: ${sku}`,
        existing ? `Existing description to improve: ${existing}` : '',
        'Requirements: single paragraph, factual, research-context only, no claims.',
        'Return only the description text, no quotes, no labels.',
      ].filter(Boolean).join('\n')

    case 'product_long_description':
      return [
        'Write a detailed long description (150-300 words) for a research peptide product.',
        `Product name: ${name}`,
        `SKU: ${sku}`,
        shortDescription ? `Short description: ${shortDescription}` : '',
        existing ? `Existing long description to improve: ${existing}` : '',
        'Requirements: 2-3 paragraphs, cover what it is, how it is supplied, and its research context.',
        'No therapeutic claims, no dosage, no human-use language. Research use only.',
        'Return only the description text, no quotes, no labels.',
      ].filter(Boolean).join('\n')

    case 'product_seo_title':
      return [
        'Write an SEO-optimised page title (max 60 characters) for a research peptide product page.',
        `Product name: ${name}`,
        `SKU: ${sku}`,
        shortDescription ? `Short description: ${shortDescription}` : '',
        'Requirements: include the product name, mention research/laboratory context, end with "| Nuclara".',
        'Return only the title string, no quotes, no labels.',
      ].filter(Boolean).join('\n')

    case 'product_seo_description':
      return [
        'Write an SEO meta description for a research peptide product page.',
        `Product name: ${name}`,
        shortDescription ? `Short description: ${shortDescription}` : '',
        'Requirements:',
        '- Between 130 and 155 characters total (count carefully)',
        '- Include the product name naturally',
        '- Research/laboratory context framing',
        '- No therapeutic or health claims',
        '- Must be a single sentence or two short sentences',
        'Return ONLY the meta description text. No quotes, no labels, no explanation.',
      ].filter(Boolean).join('\n')

    case 'product_tags':
      return [
        'Generate 5-8 relevant SEO tags/keywords for a research peptide product.',
        `Product name: ${name}`,
        `SKU: ${sku}`,
        shortDescription ? `Short description: ${shortDescription}` : '',
        categoryName ? `Category: ${categoryName}` : '',
        'Requirements: research-oriented terms, include peptide name variants, research/laboratory terms.',
        'Return as a comma-separated list only, no quotes, no labels, no numbering.',
      ].filter(Boolean).join('\n')

    case 'category_description':
      return [
        'Write a concise category description (max 100 words) for a research peptide catalogue category.',
        `Category name: ${name}`,
        existing ? `Existing description to improve: ${existing}` : '',
        'Requirements: explains the type of peptides in this category, their general research applications, research-context only.',
        'Return only the description text, no quotes, no labels.',
      ].filter(Boolean).join('\n')

    case 'category_seo_title':
      return [
        'Write an SEO page title (max 60 characters) for a research peptide category page.',
        `Category name: ${name}`,
        existing ? `Existing: ${existing}` : '',
        'Requirements: include category name, research/laboratory context, end with "| Nuclara".',
        'Return only the title string, no quotes, no labels.',
      ].filter(Boolean).join('\n')

    case 'category_seo_description':
      return [
        'Write an SEO meta description (max 155 characters) for a research peptide category page.',
        `Category name: ${name}`,
        shortDescription ? `Category description: ${shortDescription}` : '',
        'Requirements: factual, research context, no claims.',
        'Return only the meta description string, no quotes, no labels.',
      ].filter(Boolean).join('\n')

    case 'blog_excerpt':
      return [
        'Write a compelling blog post excerpt (2-3 sentences, max 200 words) for a research science article.',
        `Blog title: ${name}`,
        existing ? `Existing excerpt to improve: ${existing}` : '',
        'Requirements: engaging opening that draws readers in, factual and professional tone, research/science context.',
        'No therapeutic claims, no human-use language.',
        'Return only the excerpt text, no quotes, no labels.',
      ].filter(Boolean).join('\n')

    case 'blog_content':
      return [
        'Write a well-structured blog article body (400-600 words) for a research science publication.',
        `Blog title: ${name}`,
        shortDescription ? `Excerpt / summary: ${shortDescription}` : '',
        existing ? `Existing draft to improve or expand: ${existing}` : '',
        'Requirements:',
        '- 3-4 paragraphs separated by blank lines',
        '- Professional, factual, research-oriented tone',
        '- No therapeutic claims, no dosage, no human-use language',
        '- Reference research context and laboratory applications where relevant',
        '- No markdown headers, no bullet points - plain paragraphs only',
        'Return only the article body text, no title, no quotes, no labels.',
      ].filter(Boolean).join('\n')

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
    'blog_excerpt',
    'blog_content',
  ]),
  context: z.object({
    name: z.string().max(300).optional(),
    sku: z.string().max(100).optional(),
    shortDescription: z.string().max(1000).optional(),
    longDescription: z.string().max(5000).optional(),
    categoryName: z.string().max(200).optional(),
    existing: z.string().max(5000).optional(),
  }),
})

/**
 * POST /api/v1/ai/generate
 * Admin only — generate SEO-optimised content using the Groq API.
 * API key is server-side only and never reaches the client.
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

      const { default: Groq } = await import('groq-sdk')
      const groq = new Groq({ apiKey: env.GROQ_API_KEY })

      const completion = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
      })

      let generated = completion.choices[0]?.message?.content?.trim() ?? ''

      // Retry once with a simpler prompt for meta descriptions (model sometimes refuses)
      if (!generated && type === 'product_seo_description') {
        const fallback = `Write a 140-character SEO meta description for a research peptide called "${context.name ?? 'this peptide'}". Research use only, no health claims. Return only the description text.`
        const retry = await groq.chat.completions.create({
          model: 'openai/gpt-oss-20b',
          messages: [{ role: 'user', content: fallback }],
          temperature: 0.5,
          max_tokens: 200,
        })
        generated = retry.choices[0]?.message?.content?.trim() ?? ''
      }

      if (!generated) throw new ApiError(500, 'AI returned an empty response. Please try again.')

      ok(res, { generated })
    } catch (err) {
      if ((err as { status?: number }).status && !(err instanceof ApiError)) {
        return next(new ApiError(502, `AI service error: ${(err as Error).message}`))
      }
      next(err)
    }
  }
)
