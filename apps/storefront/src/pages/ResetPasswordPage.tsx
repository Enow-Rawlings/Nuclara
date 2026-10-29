import { useSeo } from '@/hooks/useSeo'
export default function ResetPasswordPage() {
  useSeo({
    title: 'Set new password',
    description: 'Set a new password for your Nuclara account.',
    canonicalPath: '/account/reset-password',
    noIndex: true,
  })
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-midnight-navy"></h1>
      <p className="mt-4 text-slate">This page is under construction.</p>
    </div>
  )
}

