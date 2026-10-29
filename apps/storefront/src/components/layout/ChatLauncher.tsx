import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'

type Step = 'launcher' | 'form' | 'sending' | 'success' | 'error'

export function ChatLauncher() {
  const [step, setStep] = useState<Step>('launcher')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const firstInputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Focus first input when panel opens
  useEffect(() => {
    if (step === 'form') {
      setTimeout(() => firstInputRef.current?.focus(), 50)
    }
  }, [step])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'launcher') setStep('launcher')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [step])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return

    setStep('sending')
    try {
      await api.post('/chat/conversations/guest', {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      })
      setStep('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setErrorMsg('Something went wrong. Please try again or email us directly.')
      setStep('error')
    }
  }

  const inputClass =
    'w-full rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite placeholder-slate focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal'

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {step !== 'launcher' && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Contact support"
          className="w-80 overflow-hidden rounded-xl border border-border-grey bg-cloud-white shadow-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-midnight-navy px-4 py-3">
            <div>
              <p className="font-heading text-sm font-bold text-pale-ice">Chat with us</p>
              <p className="text-xs text-slate">We typically reply within 1–2 business days.</p>
            </div>
            <button
              type="button"
              onClick={() => setStep('launcher')}
              aria-label="Close chat"
              className="rounded p-1 text-slate transition-colors hover:text-pale-ice"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {step === 'form' && (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="chat-name" className="text-xs font-medium text-graphite">
                    Name <span className="text-error-red">*</span>
                  </label>
                  <input
                    id="chat-name"
                    ref={firstInputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Your name"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="chat-email" className="text-xs font-medium text-graphite">
                    Email <span className="text-error-red">*</span>
                  </label>
                  <input
                    id="chat-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="chat-message" className="text-xs font-medium text-graphite">
                    Message <span className="text-error-red">*</span>
                  </label>
                  <textarea
                    id="chat-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={3}
                    className={[inputClass, 'resize-none'].join(' ')}
                    placeholder="How can we help?"
                  />
                </div>
                <p className="text-xs text-slate">
                  We provide product, order, and shipping support only. We cannot offer medical advice.
                </p>
                <button
                  type="submit"
                  disabled={!name.trim() || !email.trim() || !message.trim()}
                  className="flex items-center justify-center gap-2 rounded bg-scientific-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#076b76] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={14} aria-hidden="true" />
                  Send message
                </button>
              </form>
            )}

            {step === 'sending' && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-border-grey border-t-scientific-teal" aria-hidden="true" />
                <p className="text-sm text-slate">Sending your message…</p>
              </div>
            )}

            {step === 'success' && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle size={32} className="text-success-green" aria-hidden="true" />
                <p className="font-medium text-midnight-navy">Message sent</p>
                <p className="text-sm text-slate">
                  Thank you. We will reply to your email within 1–2 business days.
                </p>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-xs text-scientific-teal hover:underline"
                >
                  Send another message
                </button>
              </div>
            )}

            {step === 'error' && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <AlertCircle size={28} className="text-error-red" aria-hidden="true" />
                <p className="text-sm text-error-red">{errorMsg}</p>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-xs text-scientific-teal hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Launcher button */}
      <button
        type="button"
        onClick={() => setStep(step === 'launcher' ? 'form' : 'launcher')}
        aria-label={step === 'launcher' ? 'Open support chat' : 'Close support chat'}
        aria-expanded={step !== 'launcher'}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-midnight-navy text-pale-ice shadow-modal transition-all hover:bg-scientific-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-scientific-teal"
      >
        {step !== 'launcher' ? (
          <X size={20} aria-hidden="true" />
        ) : (
          <MessageCircle size={20} aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
