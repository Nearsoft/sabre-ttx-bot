const apiClient = require('../services/apiClient');
const queue = require('../services/messagesWorker');
const searchEngine = require('../services/searchEngine');

let userName = '';
let cityData = '';
let checkin = '';
let checkout = '';

function hello(payload) {
    const message = {
        type: 'text',
        role: 'appMaker'
    }

    userName = payload.appUser.givenName
    queue.add(payload.appUser._id, Object.assign({ text: `Hi ${userName}` }, message));
    queue.add(payload.appUser._id, Object.assign({ text: `I'm [botname] and I can help you to find the perfect hotel with all the amenities you need.` }, message));
    queue.add(payload.appUser._id, Object.assign({ text: `For fun, let’s give it a try. Where are you planning to go?` }, message));

    return true;
}

function askCity(payload) {
    const message = payload.messages[0];
    apiClient.findCity(message.text).then(function (res) {
        cityData = res;
        queue.add(payload.appUser._id, {
        type: 'text',
        text: `What's the check-in date? Say something like “June 15”`,
        role: 'appMaker'
    });
    });

    return true;
}

function askCheckinDate(payload) {
    const message = payload.messages[0];
    checkin = message.text;
    queue.add(payload.appUser._id, {
        type: 'text',
        text: `When are you checking out? Say something like “June 15”`,
        role: 'appMaker'
    });
    return true;
}

function askCheckoutDate(payload) {
    const message = payload.messages[0];
    checkout = message.text;
    searchEngine.doSearch(payload).then(() => {
        queue.add(payload.appUser._id, {
            type: 'text',
            text: 'Let’s refine these results! Please choose the amenities you prefer.',
            role: 'appMaker'
        });

        queue.add(payload.appUser._id, {
            role: "appMaker",
            type: "list",
            items: [
                {
                    title: "Free Wifi",
                    size: "large",
                    actions: [
                        {
                            text: "Free Wifi",
                            type: "postback",
                            payload: "EVENT:ADD_AMENITIES"
                        }
                    ]
                },
                {
                    title: "Breakfast",
                    size: "large",
                    actions: [
                        {
                            text: "Breakfast",
                            type: "postback",
                            payload: "EVENT:ADD_AMENITIES"
                        }
                    ]
                }
            ],
            actions: [
                {
                    text: "I'm done!",
                    type: "postback",
                    payload: "EVENT:DONE_AMENITIES"
                }
            ]
        })
    });
    
    queue.add(payload.appUser._id, {
        type: 'text',
        text: `Great! Please spare me a moment. I’m looking for hotel options for ${ cityData.city } from ${ checkin } to ${ checkout }`,
        role: 'appMaker'
    });
    return true;
}

module.exports = [
    hello,
    askCity,
    askCheckinDate,
    askCheckoutDate
];