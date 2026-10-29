import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'

type ContentMap = Record<string, string>

async function fetchContent(): Promise<ContentMap> {
  const { data } = await api.get<ApiSuccess<ContentMap>>('/content')
  return data.data
}

/**
 * Returns the content_blocks key→value map from the API.
 * Falls back to {} on error so callers always get a safe object to index into.
 */
export function useContent() {
  return useQuery({
    queryKey: ['content'],
    queryFn: fetchContent,
    staleTime: 1000 * 60 * 5, // 5 minutes — content changes infrequently
    placeholderData: {} as ContentMap,
  })
}

/**
 * Convenience: get a single content value with a fallback.
 * Usage: const label = useContentValue('homepage_hero_eyebrow', 'Research Grade Peptides')
 */
export function useContentValue(key: string, fallback: string): string {
  const { data } = useContent()
  return (data as ContentMap)?.[key] || fallback
}
