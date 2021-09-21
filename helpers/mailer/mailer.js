const config = require('../../config/config');
const nodemailer = require('nodemailer')
const { contactUsTemplate } = require('./template');
const sendMail = async ({senderName, senderEmail, mailRecipients, mailSubject, mailBody, mailAttachments = null}) => {
    try {
        // Set Mail Authentications
        const transporter = nodemailer.createTransport({
            host: config.MAIL_HOST,
            secure: true,
            port: config.MAIL_PORT,
            auth: {
                user: config.MAIL_USERNAME,
                pass: config.MAIL_PASSWORD
            }
        });

        // Send Emails
        const mailInfo = await transporter.sendMail({
            from: `${senderName} <${senderEmail}>`, // sender address
            to: mailRecipients, // list of receivers
            subject: mailSubject, // Subject line
            // text: "Hello world?", // plain text body
            html: mailBody, // html body
        });
        console.log('mail info', mailInfo)
        return {
            status: true,
            message: "Email sent successfully",
            email: mailRecipients
        };
    } catch (error) {
        console.log(error)
        return {
            status: false,
            message: `Email not sent ${error}`,
            email: mailRecipients
        };
    }
}

const prepareMail = async ({mailRecipients, mailSubject, mailBody, senderName, senderEmail}) => {
    const _sendMail = await sendMail({
        senderName, senderEmail, 
        mailRecipients, mailSubject, mailBody
    })
    return {status: _sendMail.status, message: _sendMail.message}
} 

module.exports = {
    sendMail, prepareMail
}