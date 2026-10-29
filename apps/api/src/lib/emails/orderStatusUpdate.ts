import { baseLayout, infoBox, emailButton } from './base.js'

interface OrderStatusUpdateEmailOptions {
  customerName: string
  reference: string
  newStatus: string
  note?: string | undefined
  supportEmail?: string | undefined
  storeFrontUrl?: string | undefined
}

const STATUS_MESSAGES: Record<string, { subject: string; headline: string; body: string }> = {
  under_review: {
    subject: 'Your order is under review',
    headline: 'Order under review',
    body: 'Our team is currently reviewing your order request. We will be in touch shortly.',
  },
  awaiting_payment: {
    subject: 'Payment instructions for your order',
    headline: 'Payment instructions ready',
    body: 'Your order has been reviewed and approved. Payment instructions will follow in a separate communication from our team.',
  },
  processing: {
    subject: 'Your order is being processed',
    headline: 'Order processing',
    body: 'We have received your payment and your order is now being processed for dispatch.',
  },
  fulfilled: {
    subject: 'Your order has been dispatched',
    headline: 'Order dispatched',
    body: 'Your order has been dispatched. Tracking information will be provided separately if available.',
  },
  completed: {
    subject: 'Your order is complete',
    headline: 'Order complete',
    body: 'Your order has been completed. Thank you for your order.',
  },
  cancelled: {
    subject: 'Your order has been cancelled',
    headline: 'Order cancelled',
    body: 'Your order request has been cancelled. If you have questions, please contact our team.',
  },
  rejected: {
    subject: 'Update on your order request',
    headline: 'Order request update',
    body: 'Unfortunately we are unable to fulfil this order request. Please contact our team for more information.',
  },
}

export function orderStatusUpdateEmail(opts: OrderStatusUpdateEmailOptions): string {
  const {
    customerName,
    reference,
    newStatus,
    note,
    supportEmail = 'support@nuclara.com',
    storeFrontUrl = 'https://nuclara.com',
  } = opts

  const msg = STATUS_MESSAGES[newStatus] ?? {
    subject: `Order update — ${reference}`,
    headline: 'Order update',
    body: `Your order status has been updated to: ${newStatus.replace(/_/g, ' ')}.`,
  }

  const content = `
    <h1 style="margin:0 0 8px;font-family:'Manrope',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#10243A;">${msg.headline}</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#536273;line-height:1.6;">Hi ${customerName},</p>

    ${infoBox(`
      <strong style="display:block;margin-bottom:4px;color:#10243A;">Order reference</strong>
      <span style="font-family:monospace;font-size:16px;font-weight:700;color:#087E8B;">${reference}</span>
    `)}

    <p style="margin:0 0 16px;font-size:15px;color:#202A35;line-height:1.6;">${msg.body}</p>

    ${note ? `
    <div style="border-left:3px solid #087E8B;padding-left:12px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#536273;font-style:italic;">${note}</p>
    </div>` : ''}

    ${emailButton('View order history', `${storeFrontUrl}/account/orders`)}

    <p style="margin:0;font-size:13px;color:#536273;line-height:1.6;">
      If you have any questions, contact us at
      <a href="mailto:${supportEmail}" style="color:#087E8B;">${supportEmail}</a>.
    </p>
  `

  return baseLayout(content, `${msg.subject} — ${reference}`)
}

export function getOrderStatusEmailSubject(status: string, reference: string): string {
  const msg = STATUS_MESSAGES[status]
  return msg ? `${msg.subject} — ${reference}` : `Order update — ${reference}`
}
