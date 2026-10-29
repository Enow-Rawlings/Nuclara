import { Router } from 'express'
import { supabase } from '../../lib/supabase.js'
import { env } from '../../config/env.js'

export const sitemapRouter = Router()

const STOREFRONT_ORIGIN =
  env.ALLOWED_ORIGINS.find((o) => !o.includes('5174')) ?? env.ALLOWED_ORIGINS[0] ?? 'https://nuclara.com'

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(loc: string, lastmod?: string, changefreq = 'weekly', priority = '0.7'): string {
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : '',
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * GET /api/v1/sitemap.xml
 * Dynamic sitemap — only includes canonical, published, indexable pages.
 * Admin, draft, blocked, and noindex pages are excluded.
 */
sitemapRouter.get('/sitemap.xml', async (_req, res, next) => {
  try {
    // Static routes
    const staticUrls = [
      urlEntry(`${STOREFRONT_ORIGIN}/`, undefined, 'daily', '1.0'),
      urlEntry(`${STOREFRONT_ORIGIN}/shop`, undefined, 'daily', '0.9'),
      urlEntry(`${STOREFRONT_ORIGIN}/categories`, undefined, 'weekly', '0.8'),
      urlEntry(`${STOREFRONT_ORIGIN}/about`, undefined, 'monthly', '0.5'),
      urlEntry(`${STOREFRONT_ORIGIN}/contact`, undefined, 'monthly', '0.5'),
      urlEntry(`${STOREFRONT_ORIGIN}/help`, undefined, 'monthly', '0.5'),
      urlEntry(`${STOREFRONT_ORIGIN}/shipping`, undefined, 'monthly', '0.4'),
      urlEntry(`${STOREFRONT_ORIGIN}/returns`, undefined, 'monthly', '0.4'),
      urlEntry(`${STOREFRONT_ORIGIN}/privacy`, undefined, 'monthly', '0.3'),
      urlEntry(`${STOREFRONT_ORIGIN}/terms`, undefined, 'monthly', '0.3'),
    ]

    // Published, visible, indexable products
    // Check SEO record robots directive — exclude noindex
    const { data: products } = await supabase
      .from('products')
      .select(`slug, updated_at, seo_records (robots_directive)`)
      .eq('status', 'published')
      .eq('is_visible', true)
      .order('updated_at', { ascending: false })
      .limit(500)

    const productUrls = (products ?? [])
      .filter((p) => {
        const seo = (p.seo_records as Array<{ robots_directive: string }> | null)?.[0]
        return !seo || !seo.robots_directive?.includes('noindex')
      })
      .map((p) =>
        urlEntry(`${STOREFRONT_ORIGIN}/product/${p.slug}`, p.updated_at, 'weekly', '0.8')
      )

    // Visible categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_visible', true)

    const categoryUrls = (categories ?? []).map((c) =>
      urlEntry(`${STOREFRONT_ORIGIN}/category/${c.slug}`, c.updated_at, 'weekly', '0.7')
    )

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...staticUrls,
      ...productUrls,
      ...categoryUrls,
      '</urlset>',
    ].join('\n')

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600') // cache 1 hour
    res.status(200).send(xml)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/robots.txt
 * Robots directives — allow crawling of public content, block admin.
 */
sitemapRouter.get('/robots.txt', (_req, res) => {
  const sitemapUrl = `${STOREFRONT_ORIGIN}/sitemap.xml`

  const content = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Block admin and API',
    'Disallow: /api/',
    '',
    `Sitemap: ${sitemapUrl}`,
  ].join('\n')

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=86400') // cache 24 hours
  res.status(200).send(content)
})
