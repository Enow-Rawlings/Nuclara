import { useSeo } from '@/hooks/useSeo'
export default function TermsPage() {
  useSeo({
    title: 'Terms of Service',
    description: 'Nuclara terms of service.',
    canonicalPath: '/terms',
  })
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-midnight-navy"></h1>
      <p className="mt-4 text-slate">This page is under construction.</p>
    </div>
  )
}

