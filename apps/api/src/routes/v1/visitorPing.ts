import { Router } from 'express'
import { z } from 'zod'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { sendEmail } from '../../lib/resend.js'
import { baseLayout } from '../../lib/emails/base.js'
import { env } from '../../config/env.js'

export const visitorPingRouter = Router()

function visitorAlertEmail(page: string, referrer: string, ua: string, ip: string): string {
  const now = new Date().toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })
  const content = `
    <h1 style="margin:0 0 8px;font-family:'Manrope',Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#10243A;">
      New visitor on Nuclara
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:#536273;">${now} UTC</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;border:1px solid #DCE4EA;border-radius:6px;overflow:hidden;">
      <tr style="background-color:#EAF4F5;">
        <td style="padding:10px 14px;font-size:12px;font-weight:600;color:#10243A;width:30%;">Page</td>
        <td style="padding:10px 14px;font-size:13px;color:#202A35;">${page}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-size:12px;font-weight:600;color:#10243A;border-top:1px solid #DCE4EA;">Referrer</td>
        <td style="padding:10px 14px;font-size:13px;color:#536273;border-top:1px solid #DCE4EA;">${referrer || 'Direct / unknown'}</td>
      </tr>
      <tr style="background-color:#F5F8FA;">
        <td style="padding:10px 14px;font-size:12px;font-weight:600;color:#10243A;border-top:1px solid #DCE4EA;">IP</td>
        <td style="padding:10px 14px;font-size:13px;color:#536273;border-top:1px solid #DCE4EA;">${ip}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-size:12px;font-weight:600;color:#10243A;border-top:1px solid #DCE4EA;">Browser</td>
        <td style="padding:10px 14px;font-size:13px;color:#536273;border-top:1px solid #DCE4EA;">${ua.substring(0, 120)}</td>
      </tr>
    </table>
    <p style="margin:0;font-size:12px;color:#8A9BAD;">
      You're receiving this because visitor alerts are enabled on nuclara.store.
      These are sent once per browser session.
    </p>`
  return baseLayout(content, 'New visitor on nuclara.store')
}

/**
 * POST /api/v1/visitor-ping
 * Public — fires once per browser session when someone visits the storefront.
 * Sends an email alert to EMAIL_SUPPORT. Non-blocking fire-and-forget.
 * Rate-limited by IP to prevent abuse (1 per IP per 10 min via simple in-memory map).
 */

// Simple in-memory dedup — prevents the same IP spamming alerts
// (good enough; resets on server restart)
const recentPings = new Map<string, number>()
const PING_COOLDOWN_MS = 10 * 60 * 1000 // 10 minutes per IP

visitorPingRouter.post(
  '/',
  validateBody(
    z.object({
      page: z.string().max(500).default('/'),
      referrer: z.string().max(500).default(''),
    })
  ),
  async (req, res) => {
    // Always respond immediately — never block the visitor for this
    ok(res, { received: true })

    try {
      const { page, referrer } = req.body as { page: string; referrer: string }
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown'
      const ua = (req.headers['user-agent'] ?? '').substring(0, 200)

      // Skip bots
      const botPatterns = /bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck/i
      if (botPatterns.test(ua)) return

      // Cooldown check per IP
      const lastPing = recentPings.get(ip)
      if (lastPing && Date.now() - lastPing < PING_COOLDOWN_MS) return

      recentPings.set(ip, Date.now())

      // Clean up old entries to prevent memory leak
      if (recentPings.size > 5000) {
        const cutoff = Date.now() - PING_COOLDOWN_MS
        for (const [key, ts] of recentPings.entries()) {
          if (ts < cutoff) recentPings.delete(key)
        }
      }

      if (!env.RESEND_API_KEY) return

      const recipient = env.ALERT_EMAIL || env.EMAIL_SUPPORT
      if (!recipient) return

      await sendEmail({
        to: recipient,
        subject: `New visitor on nuclara.store — ${page}`,
        html: visitorAlertEmail(page, referrer, ua, ip),
      })
    } catch {
      // Swallow all errors — this must never affect the visitor experience
    }
  }
)
