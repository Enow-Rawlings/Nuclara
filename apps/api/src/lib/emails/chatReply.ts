import { baseLayout, infoBox } from './base.js'

interface ChatReplyEmailOptions {
  guestName: string
  guestEmail: string
  replyContent: string
  supportEmail?: string | undefined
}

/**
 * Email sent to a customer/guest when an admin replies to their chat message.
 */
export function chatReplyEmail(opts: ChatReplyEmailOptions): string {
  const {
    guestName,
    replyContent,
    supportEmail = 'support@nuclara.com',
  } = opts

  const content = `
    <h1 style="margin:0 0 8px;font-family:'Manrope',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#10243A;">Reply from Nuclara support</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#536273;line-height:1.6;">Hi ${guestName},</p>

    <p style="margin:0 0 16px;font-size:15px;color:#202A35;line-height:1.6;">
      A member of our support team has replied to your enquiry:
    </p>

    ${infoBox(`<p style="margin:0;font-size:15px;color:#202A35;line-height:1.6;white-space:pre-wrap;">${replyContent}</p>`)}

    <p style="margin:16px 0 0;font-size:13px;color:#536273;line-height:1.6;">
      To continue the conversation, simply reply to this email or contact us directly at
      <a href="mailto:${supportEmail}" style="color:#087E8B;">${supportEmail}</a>.
    </p>

    <p style="margin:16px 0 0;font-size:12px;color:#8A9BAD;line-height:1.5;">
      All products supplied by Nuclara are for research and laboratory use only.
      Not intended for human or veterinary use.
    </p>
  `

  return baseLayout(
    content,
    `Support reply from Nuclara — ${guestName}`
  )
}
