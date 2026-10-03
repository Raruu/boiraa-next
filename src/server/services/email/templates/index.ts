/**
 * Template registry.
 *
 * The boilerplate ships only the base layout (`base.ts`). Add a child template
 * per email you need — each is a function that takes the raw `data` object and
 * returns a full HTML string by wrapping its body with `baseTemplate`.
 *
 * Example child (src/server/services/email/templates/welcome.ts):
 *
 *   import { baseTemplate } from "./base";
 *   export function welcomeTemplate(data: Record<string, unknown>): string {
 *     const fullname = (data.fullname as string) || "there";
 *     return baseTemplate(`
 *       <p style="font-size:16px;color:#1f2937;font-weight:600;">Welcome, ${fullname}!</p>
 *       <p style="font-size:14px;color:#4b5563;line-height:1.7;">Your account is ready.</p>
 *     `);
 *   }
 *
 * Then register it below and dispatch with:
 *   QueueService.dispatch("send_email", { to, subject, template: "welcome", data: { fullname } })
 */

export type EmailAttachment = {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
};

const templates: Record<string, (data: Record<string, unknown>) => string> = {
  // welcome: welcomeTemplate,
};

/** Render a registered template to HTML. Throws when the key is unknown. */
export function renderTemplate(
  templateName: string,
  data: Record<string, unknown>,
): { html: string; text: string } {
  const templateFn = templates[templateName];
  if (!templateFn) {
    throw new Error(`Email template "${templateName}" not found`);
  }
  const html = templateFn(data);
  return { html, text: htmlToText(html) };
}

/* Minimal HTML → text fallback for clients that refuse HTML mail. */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
