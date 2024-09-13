import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    // @ts-ignore
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASSWORD,
        clientId: process.env.clientId,
        clientSecret: process.env.clientSecret,
        refreshToken: process.env.refreshToken,
    },
    tls: {
      rejectUnauthorized: false
    }
})

export const sendEmail = async (mailto: string, mailsubject: string, mailmessage: string) => {
    try {
      const info = await transporter.sendMail({
        from:  process.env.ADMIN_EMAIL,
        to: [mailto], 
        subject: mailsubject,
        text:  mailmessage
      });

      console.log('Email sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };