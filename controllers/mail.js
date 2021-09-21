const { validationResult } = require('express-validator');
const config = require('../config/config');
const { prepareMail } = require('../helpers/mailer/mailer');
const { contactUsTemplate } = require('../helpers/mailer/template')
const { successResponse, errorResponse } = require('../helpers/utility');

const sendContactMail = async (req, res, next) => {
    // validate request body for errors
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    
    const {name, email, phone, subject, message} = req.body;
    
    // get contact us template
    const mailBody = await contactUsTemplate({ name, email, phone, subject, message });

    // prepare and send mail
    const sendEmail = await prepareMail({
        mailRecipients: config.CONTACT.DEFAULT_MAIL_RECIPIENT, 
        mailSubject: config.CONTACT.DEFAULT_MAIL_SUBJECT,
        mailBody,
        senderName: config.CONTACT.MAIL_FROM_NAME,
        senderEmail: config.CONTACT.MAIL_FROM
    });

    if(sendEmail.status)
        return successResponse(res);
    return errorResponse(res)

}

module.exports = {
    sendContactMail
}