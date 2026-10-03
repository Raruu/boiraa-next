export type EmailBrand = {
  /** App / product name shown in header + footer. Defaults to NEXT_PUBLIC_APP_NAME */
  appName?: string;
  /** Absolute URL to a logo image (shown in the header if provided) */
  logoUrl?: string | null;
  /** Short tagline under the app name */
  tagline?: string | null;
  /** Overrides the default "sent automatically, do not reply" footer note */
  footerNote?: string | null;
};

/**
 * Base email layout — wraps every child template's body with a shared
 * header + container + footer so all outgoing mail looks consistent.
 * Child templates only build the inner `body` HTML and pass brand overrides.
 *
 * Table-based markup with inline styles on purpose: that is what email
 * clients (Gmail, Outlook) actually render reliably.
 */
export function baseTemplate(body: string, brand: EmailBrand = {}): string {
  const appName = brand.appName || process.env.NEXT_PUBLIC_APP_NAME || "App";
  const tagline = brand.tagline ?? "";
  const logoUrl = brand.logoUrl ?? "";
  const footerNote =
    brand.footerNote ??
    `This email was sent automatically by ${appName}. Please do not reply.`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',-apple-system,Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background:#111827;padding:28px 40px;text-align:center;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${appName}" width="48" height="48" style="width:48px;height:48px;border-radius:8px;display:block;margin:0 auto 10px;" />` : ""}
              <p style="color:#ffffff;font-size:18px;font-weight:700;margin:0;">${appName}</p>
              ${tagline ? `<p style="color:#ffffff;font-size:12px;opacity:0.7;margin:6px 0 0;">${tagline}</p>` : ""}
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px;">
              ${body}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="font-size:12px;color:#9ca3af;line-height:1.6;margin:0;">
                ${footerNote}<br /><br />
                &copy; ${new Date().getFullYear()} ${appName}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
