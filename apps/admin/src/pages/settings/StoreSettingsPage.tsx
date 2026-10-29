import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

interface StoreSettings {
  store_name: string
  support_email: string
  from_email: string
  default_currency: string
  default_market: string
  contact_phone: string | null
  address_line1: string | null
  address_city: string | null
  address_country: string | null
}

const inputClass = 'rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal w-full'
const labelClass = 'mb-1 block text-sm font-medium text-graphite'

const CURRENCIES = ['EUR', 'GBP', 'USD', 'CHF', 'SEK', 'DKK', 'NOK']
const MARKETS = ['EU', 'GB', 'US', 'AU', 'CA', 'CH']

export default function StoreSettingsPage() {
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<StoreSettings | null>(null)

  const { isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data } = await api.get<ApiSuccess<StoreSettings>>('/settings/admin/store')
      setForm(data.data)
      return data.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: () => api.patch('/settings/admin/store', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] })
      setSaved(true)
      setError(null)
      setTimeout(() => setSaved(false), 3000)
    },
    onError: () => setError('Failed to save settings.'),
  })

  const set = (key: keyof StoreSettings, value: string) =>
    setForm((f) => f ? { ...f, [key]: value } : f)

  // If API not implemented yet, show a useful placeholder
  if (!isLoading && !form) {
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-midnight-navy">Store settings</h1>
        </div>
        <div className="rounded-lg border border-border-grey bg-pale-ice p-8 text-center">
          <p className="text-sm font-medium text-midnight-navy">Store settings</p>
          <p className="mt-2 text-sm text-slate">
            Store configuration (name, emails, currency) will be editable here once the
            settings API endpoint is implemented.
          </p>
          <p className="mt-3 text-xs text-slate">
            Endpoint required: <code className="rounded bg-border-grey px-1 py-0.5 font-mono text-graphite">GET /api/v1/settings/admin/store</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-midnight-navy">Store settings</h1>
          <p className="mt-1 text-sm text-slate">General store configuration.</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-success-green">
            <Check size={14} aria-hidden="true" /> Settings saved
          </span>
        )}
      </div>

      {error && (
        <div role="alert" className="mb-4 flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />{error}
        </div>
      )}

      {isLoading || !form ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-6 rounded-lg border border-border-grey bg-cloud-white p-6">

          <fieldset>
            <legend className="mb-4 font-heading text-sm font-semibold text-midnight-navy">General</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="store-name" className={labelClass}>Store name</label>
                <input id="store-name" type="text" className={inputClass} value={form.store_name} onChange={(e) => set('store_name', e.target.value)} />
              </div>
              <div>
                <label htmlFor="contact-phone" className={labelClass}>Contact phone</label>
                <input id="contact-phone" type="tel" className={inputClass} value={form.contact_phone ?? ''} onChange={(e) => set('contact_phone', e.target.value)} />
              </div>
            </div>
          </fieldset>

          <fieldset className="border-t border-border-grey pt-5">
            <legend className="mb-4 font-heading text-sm font-semibold text-midnight-navy">Email</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="from-email" className={labelClass}>From email</label>
                <input id="from-email" type="email" className={inputClass} value={form.from_email} onChange={(e) => set('from_email', e.target.value)} />
                <p className="mt-1 text-xs text-slate">Used as the sender for transactional emails.</p>
              </div>
              <div>
                <label htmlFor="support-email" className={labelClass}>Support email</label>
                <input id="support-email" type="email" className={inputClass} value={form.support_email} onChange={(e) => set('support_email', e.target.value)} />
              </div>
            </div>
          </fieldset>

          <fieldset className="border-t border-border-grey pt-5">
            <legend className="mb-4 font-heading text-sm font-semibold text-midnight-navy">Commerce</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="currency" className={labelClass}>Default currency</label>
                <select id="currency" className={inputClass} value={form.default_currency} onChange={(e) => set('default_currency', e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="market" className={labelClass}>Default market</label>
                <select id="market" className={inputClass} value={form.default_market} onChange={(e) => set('default_market', e.target.value)}>
                  {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="border-t border-border-grey pt-5">
            <legend className="mb-4 font-heading text-sm font-semibold text-midnight-navy">Address</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="addr-line1" className={labelClass}>Address line 1</label>
                <input id="addr-line1" type="text" className={inputClass} value={form.address_line1 ?? ''} onChange={(e) => set('address_line1', e.target.value)} />
              </div>
              <div>
                <label htmlFor="addr-city" className={labelClass}>City</label>
                <input id="addr-city" type="text" className={inputClass} value={form.address_city ?? ''} onChange={(e) => set('address_city', e.target.value)} />
              </div>
              <div>
                <label htmlFor="addr-country" className={labelClass}>Country</label>
                <input id="addr-country" type="text" className={inputClass} value={form.address_country ?? ''} onChange={(e) => set('address_country', e.target.value)} placeholder="e.g. GB" />
              </div>
            </div>
          </fieldset>

          <div className="border-t border-border-grey pt-4">
            <Button variant="primary" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              Save settings
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
