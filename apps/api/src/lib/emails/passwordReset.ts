import { baseLayout, emailButton, warningBox } from './base.js'

interface PasswordResetEmailOptions {
  resetUrl: string
  expiresInMinutes?: number
}

export function passwordResetEmail(opts: PasswordResetEmailOptions): string {
  const { resetUrl, expiresInMinutes = 60 } = opts

  const content = `
    <h1 style="margin:0 0 8px;font-family:'Manrope',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#10243A;">Reset your password</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#536273;line-height:1.6;">
      We received a request to reset your Nuclara account password. Click the button below to set a new one.
    </p>

    ${emailButton('Set new password', resetUrl)}

    ${warningBox(`This link expires in ${expiresInMinutes} minutes. If you did not request a password reset, you can safely ignore this email — your account has not been changed.`)}

    <p style="margin:0;font-size:13px;color:#536273;line-height:1.6;">
      If the button does not work, copy and paste this link into your browser:<br />
      <a href="${resetUrl}" style="color:#087E8B;word-break:break-all;">${resetUrl}</a>
    </p>
  `

  return baseLayout(content, 'Reset your Nuclara account password.')
}
