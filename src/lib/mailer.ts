import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.SMTP_FROM_EMAIL ?? smtpUser;

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
        return null;
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });
    }

    return transporter;
}

export async function sendAppEmail(params: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}) {
    const mailer = getTransporter();
    if (!mailer || !fromEmail) {
        return false;
    }

    await mailer.sendMail({
        from: fromEmail,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html
    });

    return true;
}
