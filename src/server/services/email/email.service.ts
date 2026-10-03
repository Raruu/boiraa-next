import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { renderTemplate } from "@/server/services/email/templates";
import type { EmailAttachment } from "@/server/services/email/templates";

export type { EmailAttachment };

export type SendEmailInput = {
  to: string;
  subject: string;
  /** template key registered in server/services/email/templates/index.ts */
  template: string;
  data: Record<string, unknown>;
  attachments?: EmailAttachment[];
};

/**
 * Email delivery over SMTP.
 *
 * The transporter is created lazily so importing this module never opens a
 * connection (important: the queue imports it even when QUEUE_ENABLED=false).
 */
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USERNAME
        ? {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });
  }
  return transporter;
}

export class EmailService {
  /** Render the template and send. Throws when SMTP is unreachable. */
  static async send(input: SendEmailInput): Promise<void> {
    const { html, text } = renderTemplate(input.template, input.data);
    const from =
      process.env.SMTP_FROM ||
      process.env.SMTP_USERNAME ||
      "no-reply@localhost";

    await getTransporter().sendMail({
      from: process.env.SMTP_FROM_NAME
        ? `"${process.env.SMTP_FROM_NAME}" <${from}>`
        : from,
      to: input.to,
      subject: input.subject,
      html,
      text,
      attachments: input.attachments,
    });
  }
}
