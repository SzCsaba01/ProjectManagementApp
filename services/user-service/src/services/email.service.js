import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSKEY,
            },
        });
        this.transporter
            .verify()
            .then(console.log('Gmail smtp works!'))
            .catch(console.error);
    }

    async sendEmailAsync(emailDTO) {
        try {
            const info = await this.transporter.sendMail(emailDTO);
            console.log('Email sent:', info.response);
        } catch (error) {
            console.error('Error sending email: ', error);
        }
    }

    createRegistrationEmailBody(username, registrationLink) {
        return `<span>Dear ${username},<span><br><br><div>Please confirm your email by accessing the next <a href=${registrationLink}>link</a></div>`;
    }

    createForgotPasswordEmailBody(username, forgottPasswordLink) {
        return `<span>Dear ${username},<span><br><br><div>To reset change you password access the next <a href=${forgottPasswordLink}>link</a></div>`;
    }
}

export default EmailService;
