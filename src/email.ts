import * as sgMail from '@sendgrid/mail'
import { passwords } from "./passwords";
import { config } from "./config";

class EmailMailer {
    private static fromAddress = 'noreply@comichub.io';
    private canSend = true;;

    constructor() {
        if (config.sendgridAPIKey) {
            sgMail.setApiKey(config.sendgridAPIKey);
        } else {
            console.warn('No Sendgrid API Key found in SENDGRID_API_KEY enviroment variable. Emails will not be sent.');
            this.canSend = false;
        }
    }

    public async sendPasswordResetEmail(targetEmail: string, accountID: number) {
        if (!this.canSend) return;
        const token = passwords.createPasswordResetToken(accountID);
        const url = `https://comichub.io/reset/${token}`;
        try {
            await sgMail.send({
                to: targetEmail,
                from: EmailMailer.fromAddress,
                subject: 'Password Reset',
                text: `You requested a password reset for ComicHub, change your password by visiting ${url}`,
                html: `
    <p>You requested a password reset for ComicHub.</p>
    <p>Change your password by clicking <a href="${url}" target="_blank">${url}</a>.</p>`,
            });
        } catch (err) {
            console.error(err);
        }
    }

    public async sendVerificationEmail(targetEmail: string, accountID: number) {
        if (!this.canSend) return;
        const token = passwords.createEmailVerificationToken(accountID)
        const url = `https://comichub.io/verify/${token}`;
        try {
            await sgMail.send({
                to: targetEmail,
                from: EmailMailer.fromAddress,
                subject: 'Email Verification',
                text: `Please verify your emaill address by visiting ${url}`,
                html: `
    <p>Thank you for creating an account on ComicHub.</p>
    <p>Please verify your emaill address by clicking <a href="${url}" target="_blank">${url}</a>.</p>`,
            });
        } catch (err) {
            console.error(err);
        }
    }

}

export const email = new EmailMailer();
