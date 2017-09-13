const apiClient = require('../services/apiClient');
const queue = require('../services/messagesWorker');
const searchEngine = require('../services/searchEngine');

console.log('BookingDialog');
let userName = '';

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
        queue.add(payload.appUser._id, {
            type: 'text',
            text: `When are you arriving?`,
            role: 'appMaker'
        });
    });

    return true;
}

function askCheckinDate(payload) {
    queue.add(payload.appUser._id, {
        type: 'text',
        text: `When are you leaving?`,
        role: 'appMaker'
    });
    return true;
}

function askCheckoutDate(payload, state) {
    searchEngine.doSearch(state, payload);
    queue.add(payload.appUser._id, {
        type: 'text',
        text: `Great! Please spare me a moment. I’m looking for hotel options for ${state.locationName} from ${state.checkin} to ${state.checkout}`,
        role: 'appMaker'
    });
    return true;
}

module.exports = {
    steps: [
        hello,
        askCity,
        askCheckinDate,
        askCheckoutDate
    ]
};