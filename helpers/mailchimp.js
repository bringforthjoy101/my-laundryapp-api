const mailchimp = require("@mailchimp/mailchimp_marketing");
const config = require("../config/config");
const md5 = require('md5');

mailchimp.setConfig({
  apiKey: config.MAILCHIMP_API_KEY,
  server: config.MAILCHIMP_SERVER_PREFIX,
});

const addContactToAudience = async (firstName, lastName, email) => {
    const listId = config.MAILCHIMP_LIST_ID;
    const subscribingUser = {firstName, lastName, email};

    const response = await mailchimp.lists.addListMember(listId, {
        email_address: subscribingUser.email,
        status: "subscribed",
        merge_fields: {
            FNAME: subscribingUser.firstName,
            LNAME: subscribingUser.lastName
        }
    });
    // console.log(response)
    console.log(`Successfully added contact as an audience member. The contact's id is ${response.id}.`);
}

const removeContactFromAudience = async (email) => {
    const listId = config.MAILCHIMP_LIST_ID;
    const subscriberHash = md5(email.toLowerCase());

    const response = await mailchimp.lists.updateListMember(
        listId, subscriberHash,
        { status: "unsubscribed" }
    );

    console.log(`This user is now ${response.status}.`);
    
}

module.exports = {
    addContactToAudience, removeContactFromAudience
}



