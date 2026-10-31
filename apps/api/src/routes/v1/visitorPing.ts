import { Router } from 'express'
import { z } from 'zod'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { sendEmail } from '../../lib/resend.js'
import { baseLayout } from '../../lib/emails/base.js'
import { env } from '../../config/env.js'

export const visitorPingRouter = Router()

interface GeoData {
  country: string
  countryCode: string
  city: string
  region: string
  isp: string
}

async function getGeoData(ip: string): Promise<GeoData | null> {
  // Skip private/local IPs
  if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('::1') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return null
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp`, {
      signal: AbortSignal.timeout(3000), // 3s max — never block
    })
    const data = await res.json() as { status: string; country: string; countryCode: string; regionName: string; city: string; isp: string }
    if (data.status !== 'success') return null
    return {
      country: data.country,
      countryCode: data.countryCode,
      city: data.city,
      region: data.regionName,
      isp: data.isp,
    }
  } catch {
    return null
  }
}

function getFlagEmoji(countryCode: string): string {
  // Convert country code to flag emoji (regional indicator symbols)
  return countryCode
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('')
}

function visitorAlertEmail(page: string, referrer: string, ua: string, ip: string, geo: GeoData | null): string {
  const now = new Date().toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })

  const locationLine = geo
    ? `${getFlagEmoji(geo.countryCode)} ${geo.city ? `${geo.city}, ` : ''}${geo.region ? `${geo.region}, ` : ''}${geo.country} (${geo.countryCode})`
    : 'Unknown'

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
        <td style="padding:10px 14px;font-size:12px;font-weight:600;color:#10243A;border-top:1px solid #DCE4EA;">Location</td>
        <td style="padding:10px 14px;font-size:13px;color:#202A35;border-top:1px solid #DCE4EA;">${locationLine}</td>
      </tr>
      ${geo?.isp ? `<tr style="background-color:#F5F8FA;">
        <td style="padding:10px 14px;font-size:12px;font-weight:600;color:#10243A;border-top:1px solid #DCE4EA;">ISP</td>
        <td style="padding:10px 14px;font-size:13px;color:#536273;border-top:1px solid #DCE4EA;">${geo.isp}</td>
      </tr>` : ''}
      <tr${!geo?.isp ? ' style="background-color:#F5F8FA;"' : ''}>
        <td style="padding:10px 14px;font-size:12px;font-weight:600;color:#10243A;border-top:1px solid #DCE4EA;">Referrer</td>
        <td style="padding:10px 14px;font-size:13px;color:#536273;border-top:1px solid #DCE4EA;">${referrer || 'Direct / unknown'}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-size:12px;font-weight:600;color:#10243A;border-top:1px solid #DCE4EA;">IP</td>
        <td style="padding:10px 14px;font-size:13px;color:#536273;border-top:1px solid #DCE4EA;">${ip}</td>
      </tr>
      <tr style="background-color:#F5F8FA;">
        <td style="padding:10px 14px;font-size:12px;font-weight:600;color:#10243A;border-top:1px solid #DCE4EA;">Browser</td>
        <td style="padding:10px 14px;font-size:13px;color:#536273;border-top:1px solid #DCE4EA;">${ua.substring(0, 120)}</td>
      </tr>
    </table>
    <p style="margin:0;font-size:12px;color:#8A9BAD;">
      Sent once per browser session. Geo data from ip-api.com.
    </p>`
  return baseLayout(content, 'New visitor on nuclara.store')
}

// Simple in-memory dedup — prevents same IP spamming alerts
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

      // Geo lookup — non-blocking, fails gracefully
      const geo = await getGeoData(ip)

      const locationLabel = geo
        ? `${geo.city ? `${geo.city}, ` : ''}${geo.country}`
        : 'Unknown location'

      await sendEmail({
        to: recipient,
        subject: `New visitor from ${locationLabel} — ${page}`,
        html: visitorAlertEmail(page, referrer, ua, ip, geo),
      })
    } catch {
      // Swallow all errors — never affect the visitor experience
    }
  }
)
