const apiClient = require('../services/apiClient');
const queue = require('../services/messagesWorker');
const searchEngine = require('../services/searchEngine');

console.log('BookingDialog');
let userName = '';
let cityData = {};
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

function askCheckoutDate(payload) {
    searchEngine.doSearch(getSearchSettings(), payload).then(() => {
        queue.add(payload.appUser._id, {
            type: 'text',
            text: 'Let’s refine these results! Please choose the amenities you prefer.',
            role: 'appMaker'
        });

        apiClient.getProfile('women').then(amenities => {
            let items = amenities.map(amenity => {
                return {
                    title: amenity,
                    size: "large",
                    actions: [
                        {
                            text: amenity,
                            type: "postback",
                            payload: "EVENT:ADD_AMENITIES"
                        }
                    ]
                }
            });

            items = items.slice(0, 9);
            queue.add(payload.appUser._id, {
                role: "appMaker",
                type: "list",
                items,
                actions: [
                    {
                        text: "I'm done!",
                        type: "postback",
                        payload: "EVENT:DONE_AMENITIES"
                    }
                ]
            });
        });
    });

    queue.add(payload.appUser._id, {
        type: 'text',
        text: `Great! Please spare me a moment. I’m looking for hotel options for ${cityData.city} from ${checkin} to ${checkout}`,
        role: 'appMaker'
    });
    return true;
}

function setCity(city) {
    apiClient.findCity(city).then(function (res) {
        if (res) {
            console.log('CITY ASSIGNED', res);
            cityData = res;
        }
    });
}

function setCheckinDate(date) {
    checkin = date;
}

function setCheckoutDate(date) {
    checkout = date;
}

function getSearchSettings() {
    return {
        cityData,
        checkin,
        checkout,
        amenities: []
    }
}

module.exports = {
    methods: {
        setCity,
        setCheckoutDate,
        setCheckinDate,
        getSearchSettings
    },
    steps: [
        hello,
        askCity,
        askCheckinDate,
        askCheckoutDate
    ]
};