import { useEffect } from 'react'

const SITE_NAME = 'Nuclara'
const DEFAULT_DESCRIPTION =
  'Nuclara supplies research-grade synthetic peptides to qualified laboratories and researchers. Compliance-gated catalogue, transparent documentation.'

interface SeoOptions {
  title?: string | undefined
  description?: string | undefined
  canonicalPath?: string | undefined
  noIndex?: boolean | undefined
  image?: string | undefined
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name'
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function removeCanonical() {
  document.querySelector('link[rel="canonical"]')?.remove()
}

function setRobots(noIndex: boolean) {
  setMeta('robots', noIndex ? 'noindex,nofollow' : 'index,follow')
}

export function useSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  noIndex = false,
  image,
}: SeoOptions = {}) {
  useEffect(() => {
    // Page title — "Page name | Nuclara" or just "Nuclara"
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME

    // Meta description
    setMeta('description', description)

    // Robots
    setRobots(noIndex)

    // Canonical
    if (canonicalPath && !noIndex) {
      const origin = window.location.origin
      setCanonical(`${origin}${canonicalPath}`)
    } else {
      removeCanonical()
    }

    // Open Graph
    setMeta('og:title', title ? `${title} | ${SITE_NAME}` : SITE_NAME, true)
    setMeta('og:description', description, true)
    setMeta('og:site_name', SITE_NAME, true)
    setMeta('og:type', 'website', true)
    if (canonicalPath) {
      setMeta('og:url', `${window.location.origin}${canonicalPath}`, true)
    }
    if (image) {
      setMeta('og:image', image, true)
    }

    // Twitter card
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title ? `${title} | ${SITE_NAME}` : SITE_NAME)
    setMeta('twitter:description', description)

    // Cleanup: reset to defaults when component unmounts
    return () => {
      document.title = SITE_NAME
    }
  }, [title, description, canonicalPath, noIndex, image])
}
