import { useState } from 'react'
import { Sparkles, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'

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

interface AiGenerateContext {
  name?: string
  sku?: string
  shortDescription?: string
  longDescription?: string
  categoryName?: string
  existing?: string
}

interface AiGenerateButtonProps {
  type: GenerationType
  context: AiGenerateContext
  onGenerated: (text: string) => void
  /** Optional label — defaults to "Generate" */
  label?: string
  /** If true, shows inline below the button */
  showError?: boolean
}

/**
 * Small AI generate button that calls POST /ai/generate and passes
 * the result back via onGenerated(). Drop it next to any text field.
 */
export function AiGenerateButton({
  type,
  context,
  onGenerated,
  label = 'Generate',
  showError = true,
}: AiGenerateButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post<ApiSuccess<{ generated: string }>>('/ai/generate', {
        type,
        context,
      })
      onGenerated(data.data.generated)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'AI generation failed. Try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded border border-scientific-teal/40 bg-[#e6f4f5] px-2.5 py-1 text-xs font-medium text-scientific-teal transition-colors hover:bg-scientific-teal hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={loading ? 'Generating…' : label}
      >
        <Sparkles size={11} aria-hidden="true" className={loading ? 'animate-pulse' : ''} />
        {loading ? 'Generating…' : label}
      </button>
      {showError && error && (
        <p className="flex items-center gap-1 text-xs text-error-red">
          <AlertTriangle size={10} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  )
}
