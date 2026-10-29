import { Truck, Globe, Clock, Thermometer, Info } from 'lucide-react'

const zones = [
  {
    name: 'European Union',
    code: 'EU',
    countries: 'AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE',
    methods: [
      { name: 'Standard international', transit: '3–7 business days', notes: 'DHL / DPD' },
      { name: 'Express international', transit: '1–3 business days', notes: 'DHL Express' },
      { name: 'Cold-chain (dry ice)', transit: '1–3 business days', notes: 'Mon–Wed dispatch only' },
    ],
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    countries: 'GB',
    methods: [
      { name: 'Standard', transit: '2–5 business days', notes: 'Royal Mail / DPD' },
      { name: 'Express', transit: '1–2 business days', notes: 'DPD Next Day' },
    ],
  },
  {
    name: 'United States',
    code: 'US',
    countries: 'US',
    methods: [
      { name: 'Standard international', transit: '5–10 business days', notes: 'FedEx / UPS' },
      { name: 'Express international', transit: '2–4 business days', notes: 'FedEx International Priority' },
    ],
  },
  {
    name: 'Canada',
    code: 'CA',
    countries: 'CA',
    methods: [
      { name: 'Standard international', transit: '5–10 business days', notes: 'FedEx / UPS' },
    ],
  },
  {
    name: 'Australia',
    code: 'AU',
    countries: 'AU',
    methods: [
      { name: 'Standard international', transit: '7–14 business days', notes: 'DHL / Toll' },
    ],
  },
]

export default function ShippingSettingsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">Shipping settings</h1>
        <p className="mt-1 text-sm text-slate">
          Shipping zones, methods, and carrier configuration reference.
        </p>
      </div>

      {/* Cold-chain notice */}
      <div className="mb-6 flex gap-3 rounded-lg border border-[#bde0e6] bg-[#e6f4f5] p-4">
        <Thermometer size={16} className="mt-0.5 flex-shrink-0 text-scientific-teal" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-semibold text-midnight-navy">Cold-chain policy</p>
          <p className="mt-0.5 text-slate">
            Products requiring refrigerated or frozen transit are dispatched
            <strong className="font-medium text-graphite"> Monday to Wednesday only</strong> to
            avoid weekend delays in transit. Cold-chain shipments use dry ice or gel packs
            as appropriate for the product.
          </p>
        </div>
      </div>

      {/* Processing time */}
      <div className="mb-6 flex gap-3 rounded-lg border border-border-grey bg-cloud-white p-4">
        <Clock size={16} className="mt-0.5 flex-shrink-0 text-slate" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-semibold text-midnight-navy">Order processing time</p>
          <p className="mt-0.5 text-slate">
            Orders are reviewed for compliance before dispatch. Standard processing is
            <strong className="font-medium text-graphite"> 1–2 business days</strong>.
            Orders placed after 14:00 GMT Friday are processed the following Monday.
          </p>
        </div>
      </div>

      {/* Zone table */}
      <h2 className="mb-4 font-heading text-base font-semibold text-midnight-navy">Shipping zones</h2>
      <div className="space-y-4">
        {zones.map((zone) => (
          <div key={zone.code} className="overflow-hidden rounded-lg border border-border-grey">
            <div className="flex items-center gap-2 border-b border-border-grey bg-pale-ice px-4 py-3">
              <Globe size={14} className="text-slate" aria-hidden="true" />
              <span className="font-heading text-sm font-semibold text-midnight-navy">{zone.name}</span>
              <span className="ml-auto font-mono text-xs text-slate">{zone.code}</span>
            </div>
            <div className="px-4 py-3">
              <p className="mb-3 text-xs text-slate">{zone.countries}</p>
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="text-left text-xs font-semibold text-graphite">
                    <th className="pb-2 pr-4">Method</th>
                    <th className="pb-2 pr-4">Transit</th>
                    <th className="pb-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-grey/50">
                  {zone.methods.map((method) => (
                    <tr key={method.name}>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-1.5">
                          <Truck size={12} className="flex-shrink-0 text-slate" aria-hidden="true" />
                          <span className="text-graphite">{method.name}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-xs text-slate">{method.transit}</td>
                      <td className="py-2 text-xs text-slate">{method.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3 rounded-lg border border-border-grey bg-pale-ice p-4">
        <Info size={16} className="mt-0.5 flex-shrink-0 text-slate" aria-hidden="true" />
        <p className="text-xs text-slate">
          Shipping rates and carrier accounts are configured directly with each carrier.
          To update shipping zones or add new carriers, contact your logistics administrator
          or update the carrier configuration in your Render environment variables.
        </p>
      </div>
    </div>
  )
}
