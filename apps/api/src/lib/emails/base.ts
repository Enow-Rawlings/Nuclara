/**
 * Base HTML email layout.
 * All transactional emails share this shell for consistent branding.
 * Keep inline styles — email clients strip external stylesheets.
 */
export function baseLayout(content: string, previewText = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Nuclara</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#FAFCFD;font-family:'Inter',Helvetica,Arial,sans-serif;color:#202A35;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAFCFD;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #DCE4EA;border-radius:8px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#10243A;padding:24px 32px;">
              <span style="font-family:'Manrope',Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#FAFCFD;letter-spacing:-0.3px;">Nuclara</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #DCE4EA;padding:20px 32px;background-color:#F5F8FA;">
              <p style="margin:0;font-size:12px;color:#536273;line-height:1.5;">
                This email was sent by Nuclara. If you have questions, contact us at
                <a href="mailto:support@nuclara.com" style="color:#087E8B;text-decoration:none;">support@nuclara.com</a>.
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#8A9BAD;">
                Nuclara · Research-grade peptides for laboratory use only.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
  <!-- /Wrapper -->
</body>
</html>`
}

/** Reusable button block */
export function emailButton(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td style="background-color:#087E8B;border-radius:6px;padding:12px 24px;">
        <a href="${href}" style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;display:inline-block;">${label}</a>
      </td>
    </tr>
  </table>`
}

/** Reusable info box (light teal background) */
export function infoBox(content: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
    <tr>
      <td style="background-color:#EAF4F5;border-radius:6px;padding:16px;font-size:14px;color:#202A35;line-height:1.6;">
        ${content}
      </td>
    </tr>
  </table>`
}

/** Reusable warning box (amber) */
export function warningBox(content: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
    <tr>
      <td style="background-color:#FEF9EC;border:1px solid #F0C674;border-radius:6px;padding:16px;font-size:14px;color:#202A35;line-height:1.6;">
        ${content}
      </td>
    </tr>
  </table>`
}
