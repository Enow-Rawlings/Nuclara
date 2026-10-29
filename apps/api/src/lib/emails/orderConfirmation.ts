import { baseLayout, infoBox, warningBox } from './base.js'

interface OrderConfirmationEmailOptions {
  customerName: string
  reference: string
  items: Array<{
    name: string
    sku: string
    quantity: number
    unitPrice: number
    lineTotal: number
    currency: string
  }>
  subtotal: number
  currency: string
  shippingAddress: {
    line1: string
    line2?: string | undefined
    city: string
    region?: string | undefined
    postalCode: string
    country: string
  }
  supportEmail?: string | undefined
}

export function orderConfirmationEmail(opts: OrderConfirmationEmailOptions): string {
  const { customerName, reference, items, subtotal, currency, shippingAddress, supportEmail = 'support@nuclara.com' } = opts

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount)

  const addrLines = [
    shippingAddress.line1,
    shippingAddress.line2,
    `${shippingAddress.city}${shippingAddress.region ? ', ' + shippingAddress.region : ''} ${shippingAddress.postalCode}`,
    shippingAddress.country,
  ].filter(Boolean).join('<br />')

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #DCE4EA;font-size:14px;color:#202A35;">
        ${item.name}<br />
        <span style="font-size:12px;color:#536273;font-family:monospace;">${item.sku}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #DCE4EA;font-size:14px;color:#536273;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #DCE4EA;font-size:14px;color:#202A35;text-align:right;font-variant-numeric:tabular-nums;">${fmt(item.lineTotal)}</td>
    </tr>`).join('')

  const content = `
    <h1 style="margin:0 0 8px;font-family:'Manrope',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#10243A;">Order request received</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#536273;line-height:1.6;">Hi ${customerName}, thank you for your order request. Here's a summary.</p>

    ${infoBox(`
      <strong style="display:block;margin-bottom:4px;color:#10243A;">Reference number</strong>
      <span style="font-family:monospace;font-size:18px;font-weight:700;color:#087E8B;letter-spacing:1px;">${reference}</span>
      <br /><span style="font-size:12px;color:#536273;">Keep this for your records.</span>
    `)}

    <!-- Items -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr>
        <th style="text-align:left;font-size:12px;font-weight:600;color:#536273;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:8px;border-bottom:2px solid #DCE4EA;">Product</th>
        <th style="text-align:center;font-size:12px;font-weight:600;color:#536273;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:8px;border-bottom:2px solid #DCE4EA;">Qty</th>
        <th style="text-align:right;font-size:12px;font-weight:600;color:#536273;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:8px;border-bottom:2px solid #DCE4EA;">Total</th>
      </tr>
      ${itemRows}
      <tr>
        <td colspan="2" style="padding:12px 0 0;font-size:14px;font-weight:600;color:#10243A;text-align:right;">Subtotal</td>
        <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#10243A;text-align:right;font-variant-numeric:tabular-nums;">${fmt(subtotal)}</td>
      </tr>
    </table>

    <!-- Shipping address -->
    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#536273;text-transform:uppercase;letter-spacing:0.05em;">Shipping to</p>
    <p style="margin:0 0 24px;font-size:14px;color:#202A35;line-height:1.6;">${addrLines}</p>

    <!-- What happens next -->
    <h2 style="margin:0 0 12px;font-family:'Manrope',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:#10243A;">What happens next</h2>
    <ol style="margin:0 0 20px;padding-left:20px;font-size:14px;color:#202A35;line-height:1.8;">
      <li>Our team will review your request, usually within 1–2 business days.</li>
      <li>We will contact you with payment and fulfilment details.</li>
      <li>Your order will be dispatched once payment is confirmed.</li>
    </ol>

    ${warningBox(`<strong>No payment has been taken.</strong> This is a request only. Do not send payment until you receive instructions from our team. If you have questions, email <a href="mailto:${supportEmail}" style="color:#087E8B;">${supportEmail}</a>.`)}

    <p style="margin:0;font-size:13px;color:#536273;">All products are supplied for <strong>research and laboratory use only</strong>. Not for human or veterinary use.</p>
  `

  return baseLayout(content, `Order request ${reference} received — we'll be in touch shortly.`)
}
