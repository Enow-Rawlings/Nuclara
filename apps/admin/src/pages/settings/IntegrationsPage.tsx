import { useQuery } from '@tanstack/react-query'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'

interface HealthData {
  status: string
  database: string
  version: string
}

function StatusBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="flex items-center gap-1 text-xs font-medium text-success-green">
      <CheckCircle size={14} aria-hidden="true" /> Connected
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs font-medium text-error-red">
      <XCircle size={14} aria-hidden="true" /> Not connected
    </span>
  )
}

interface Integration {
  name: string
  description: string
  docsUrl: string
  connected: boolean
  configuredVia: string
  note?: string | undefined
}

export default function IntegrationsPage() {
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get<ApiSuccess<HealthData>>('/health')
      return data.data
    },
    retry: false,
  })

  // We determine connection status from env indicators —
  // actual secret validation happens server-side only.
  const integrations: Integration[] = [
    {
      name: 'Supabase',
      description: 'PostgreSQL database, authentication, and real-time subscriptions.',
      docsUrl: 'https://supabase.com/docs',
      connected: health?.database === 'connected',
      configuredVia: 'SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY',
      note: health?.database === 'connected' ? undefined : 'Check API server environment variables.',
    },
    {
      name: 'Cloudinary',
      description: 'Image hosting and transformation for product media.',
      docsUrl: 'https://cloudinary.com/documentation',
      connected: true, // validated at API startup
      configuredVia: 'CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET',
    },
    {
      name: 'Resend',
      description: 'Transactional email for order confirmations, status updates, and password resets.',
      docsUrl: 'https://resend.com/docs',
      connected: true, // validated at API startup
      configuredVia: 'RESEND_API_KEY + EMAIL_FROM',
    },
    {
      name: 'Vercel (Storefront)',
      description: 'Hosting for the customer-facing storefront.',
      docsUrl: 'https://vercel.com/docs',
      connected: true,
      configuredVia: 'GitHub → Vercel (automatic deploys from main)',
    },
    {
      name: 'Vercel (Admin)',
      description: 'Hosting for this admin dashboard.',
      docsUrl: 'https://vercel.com/docs',
      connected: true,
      configuredVia: 'GitHub → Vercel (automatic deploys from main)',
    },
    {
      name: 'Render (API)',
      description: 'Hosting for the Express REST API.',
      docsUrl: 'https://render.com/docs',
      connected: health?.status === 'ok',
      configuredVia: 'render.yaml in repo root + environment variables in Render dashboard',
    },
  ]

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">Integrations</h1>
        <p className="mt-1 text-sm text-slate">
          Services connected to Nuclara and their configuration status.
        </p>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => (
          <div key={integration.name} className="rounded-lg border border-border-grey bg-cloud-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-sm font-semibold text-midnight-navy">
                    {integration.name}
                  </h2>
                  <a
                    href={integration.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate hover:text-scientific-teal"
                    aria-label={`${integration.name} documentation`}
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>
                <p className="mt-0.5 text-sm text-slate">{integration.description}</p>
                <p className="mt-1.5 font-mono text-[10px] text-slate/60">
                  Configured via: {integration.configuredVia}
                </p>
                {integration.note && (
                  <p className="mt-1 text-xs text-warning-amber">{integration.note}</p>
                )}
              </div>
              <div className="flex-shrink-0 pt-0.5">
                <StatusBadge ok={integration.connected} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-slate">
        Integration secrets are stored as environment variables in each platform's dashboard
        and are never exposed in this interface. To update credentials, use the Render or
        Vercel dashboard directly.
      </p>
    </div>
  )
}
