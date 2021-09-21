const DB = require('./db');
const config = require('../config/config');
const { successResponse, errorResponse, handleResponse } = require('../helpers/utility');
const moment = require('moment');
const { validationResult } = require('express-validator');
const {subscribeTemplate} = require('../helpers/mailer/template');
const { prepareMail } = require('../helpers/mailer/mailer');
const { addContactToAudience, removeContactFromAudience } = require('../helpers/mailchimp');

const subscribe = async (req, res, next) => {
    // validate request body for errors
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    const {firstName, lastName, email} = req.body;
    const subscriberData = {firstName, lastName, email};
    try {
        const subscriberExists = await DB.subscribers.findOne({where: {email, status:'subscribed'}});
        if (subscriberExists)
            // return errorResponse(res, `Subscriber with email ${email} already exists!`)
            return handleResponse(res, 200, false, `Subscriber with email ${email} already exists!`)
        const addSubscriber = await DB.subscribers.create(subscriberData);
        if (addSubscriber) {
            // subscribe user on mailchimp list
            await addContactToAudience(firstName, lastName, email);

            // get contact us template
            const mailBody = await subscribeTemplate({ firstName, email });
            
            // prepare and send mail
            const sendEmail = await prepareMail({
                mailRecipients: email, 
                mailSubject: config.SUBSCRIBE.DEFAULT_MAIL_SUBJECT,
                mailBody,
                senderName: config.SUBSCRIBE.MAIL_FROM_NAME,
                senderEmail: config.SUBSCRIBE.MAIL_FROM
            });
            if(sendEmail.status)
                return successResponse(res);
            return errorResponse(res)
        } else {
            return errorResponse(res);
        }
            
        
    } catch (error) {
        console.log(`Error:- ${error}`)
        return errorResponse(res, `An error occured:- ${error}`);
    }
    
}

const unsubscribe = async (req, res, next) => {
    const {email} = req.params;
    try {
        const subscriber = await DB.subscribers.findOne({where: {email, status:'subscribed'}});
        if(!subscriber)
            return errorResponse(res, `${email} does not exists or has already unsubscribed`);
        await removeContactFromAudience(email);
        await subscriber.update({status:'unsubscribed'});
        return successResponse(res, `${email} successfully unsubscribed from newsletter`)
    } catch (error) {
        console.log(`Error:- ${error}`)
        return errorResponse(res, `An error occured:- ${error}`);
    }
}

const getSubscribers = async (req, res, next) => {
    try {
        const subscribers = await DB.subscribers.findAll({where: {status:'subscribed'}});
        const data = [];
        if(subscribers.length) {
            
            subscribers.map(subscriber => {
                const {firstName, lastName, email, createdAt} = subscriber;
                data.push({firstName, lastName, email, createdAt: `${moment(createdAt).format('L')} ${moment(createdAt).format('LTS')}`});
            })
        }
        return successResponse(res, 'Operation successfull', data);
    } catch (error) {
        console.log(`Error:- ${error}`)
        return errorResponse(res, `An error occured:- ${error}`);
    }
}

module.exports = {
    subscribe, unsubscribe, getSubscribers
}