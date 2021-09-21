var config = {}
config.PORT = process.env.PORT
config.SSL = true

// EMAIL CREDENTIALS
config.MAIL_HOST = process.env.MAIL_HOST
config.MAIL_SECURE = process.env.MAIL_SECURE
config.MAIL_PORT = process.env.MAIL_PORT
config.MAIL_USERNAME = process.env.MAIL_USERNAME
config.MAIL_PASSWORD = process.env.MAIL_PASSWORD
config.CONTACT = {
    MAIL_FROM: process.env.CONTACT_MAIL_HOST,
    MAIL_FROM_NAME: process.env.CONTACT_MAIL_FROM_NAME,
    DEFAULT_MAIL_RECIPIENT: process.env.DEFAULT_MAIL_RECIPIENT,
    DEFAULT_MAIL_SUBJECT: process.env.DEFAULT_MAIL_SUBJECT
}
config.SUBSCRIBE = {
    MAIL_FROM: process.env.SUBSCRIBE_MAIL_FROM,
    MAIL_FROM_NAME: process.env.SUBSCRIBE_MAIL_FROM_NAME,
    DEFAULT_MAIL_SUBJECT: process.env.SUBSCRIBE_DEFAULT_MAIL_SUBJECT
}
config.DBNAME = process.env.DBNAME
config.DBUSERNAME = process.env.DBUSERNAME
config.DBPASSWORD = process.env.DBPASSWORD
config.DBHOST = process.env.DBHOST
config.DBPORT = process.env.DBPORT
config.DBDIALECT = process.env.DBDIALECT
config.MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY
config.MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX
config.MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID


module.exports = config