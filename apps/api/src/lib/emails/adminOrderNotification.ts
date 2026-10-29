import { baseLayout, emailButton } from './base.js'

interface AdminOrderNotificationOptions {
  reference: string
  customerName: string
  customerEmail: string
  subtotal: number
  currency: string
  itemCount: number
  marketCode: string
  adminUrl?: string
}

export function adminOrderNotificationEmail(opts: AdminOrderNotificationOptions): string {
  const {
    reference,
    customerName,
    customerEmail,
    subtotal,
    currency,
    itemCount,
    marketCode,
    adminUrl = 'https://admin.nuclara.com',
  } = opts

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount)

  const content = `
    <h1 style="margin:0 0 8px;font-family:'Manrope',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#10243A;">New order request</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#536273;">A new order request requires your review.</p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      ${[
        ['Reference', `<span style="font-family:monospace;font-weight:700;color:#087E8B;">${reference}</span>`],
        ['Customer', `${customerName} &lt;${customerEmail}&gt;`],
        ['Market', marketCode],
        ['Items', String(itemCount)],
        ['Subtotal', fmt(subtotal)],
      ].map(([label, value]) => `
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#536273;width:120px;vertical-align:top;">${label}</td>
          <td style="padding:6px 0;font-size:14px;color:#202A35;">${value}</td>
        </tr>`).join('')}
    </table>

    ${emailButton('Review in admin dashboard', `${adminUrl}/orders`)}

    <p style="margin:0;font-size:12px;color:#8A9BAD;">
      Payment status: <em>not configured</em> — do not mark as paid without a verified payment workflow.
    </p>
  `

  return baseLayout(content, `New order request ${reference} from ${customerName}`)
}
