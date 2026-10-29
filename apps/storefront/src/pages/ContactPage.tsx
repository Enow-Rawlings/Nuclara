import { useState } from 'react'
import { Mail, MessageSquare, Clock } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { Button } from '@/components/ui/Button'

export default function ContactPage() {
  useSeo({
    title: 'Contact',
    description: 'Get in touch with the Nuclara team for product enquiries, compliance questions, or order support.',
    canonicalPath: '/contact',
  })

  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production this would POST to /api/v1/contact
    setSubmitted(true)
  }

  return (
    <div>
      {/* ── Header ── */}
      <section className="border-b border-border-grey bg-midnight-navy">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-scientific-teal">Contact</p>
          <h1 className="font-heading text-4xl font-bold text-white">Get in touch</h1>
          <p className="mt-3 max-w-xl text-lg text-white/80">
            Have a product question, need compliance guidance, or need help with an order? We're here.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">

          {/* ── Contact info ── */}
          <div className="space-y-8 lg:col-span-1">
            {[
              {
                icon: <Mail size={20} aria-hidden="true" />,
                title: 'Email us',
                body: 'For general enquiries and product questions.',
                detail: 'support@nuclara.com',
              },
              {
                icon: <MessageSquare size={20} aria-hidden="true" />,
                title: 'Live chat',
                body: 'Start a chat from any page using the launcher in the bottom-right corner.',
                detail: 'Available during business hours',
              },
              {
                icon: <Clock size={20} aria-hidden="true" />,
                title: 'Response times',
                body: 'We aim to respond to all enquiries within one business day.',
                detail: 'Mon – Fri, 09:00 – 17:00 GMT',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#e6f4f5] text-scientific-teal">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-heading text-sm font-semibold text-midnight-navy">{item.title}</h3>
                  <p className="mt-0.5 text-sm text-slate">{item.body}</p>
                  <p className="mt-0.5 text-sm font-medium text-graphite">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Form ── */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="rounded-xl border border-border-grey bg-pale-ice p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f4f5] text-scientific-teal">
                  <Mail size={24} aria-hidden="true" />
                </div>
                <h2 className="font-heading text-xl font-bold text-midnight-navy">Message sent</h2>
                <p className="mt-2 text-sm text-slate">
                  Thanks for reaching out. We'll get back to you within one business day.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-xl border border-border-grey bg-pale-ice p-8"
                aria-label="Contact form"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-graphite">
                      Full name <span aria-hidden="true" className="text-error-red">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-border-grey bg-cloud-white px-4 py-2.5 text-sm text-graphite placeholder:text-slate/50 focus:border-scientific-teal focus:outline-none"
                      placeholder="Dr. Jane Smith"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-graphite">
                      Email address <span aria-hidden="true" className="text-error-red">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-lg border border-border-grey bg-cloud-white px-4 py-2.5 text-sm text-graphite placeholder:text-slate/50 focus:border-scientific-teal focus:outline-none"
                      placeholder="jane@laboratory.org"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-graphite">
                    Subject <span aria-hidden="true" className="text-error-red">*</span>
                  </label>
                  <select
                    id="subject"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-lg border border-border-grey bg-cloud-white px-4 py-2.5 text-sm text-graphite focus:border-scientific-teal focus:outline-none"
                  >
                    <option value="">Select a topic…</option>
                    <option value="product">Product enquiry</option>
                    <option value="compliance">Compliance / regulatory question</option>
                    <option value="order">Order support</option>
                    <option value="account">Account question</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-graphite">
                    Message <span aria-hidden="true" className="text-error-red">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full resize-none rounded-lg border border-border-grey bg-cloud-white px-4 py-2.5 text-sm text-graphite placeholder:text-slate/50 focus:border-scientific-teal focus:outline-none"
                    placeholder="Describe your question or issue…"
                  />
                </div>
                <Button type="submit" variant="primary" size="md">
                  Send message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
