const queue = require('../services/messagesWorker');
const apiClient = require('../services/apiClient');

let results = [];

function doSearch(settings, payload) {
    return apiClient.getHotels(settings).then(function (hotels) {
        let items = hotels.map(function (hotel, index) {
            return {
                title: hotel.name,
                description: '',
                mediaUrl: hotel.image_url,
                phoneNumber: hotel.phone_number,
                address: hotel.address,
                price: hotel.price,
                actions: [{
                    text: 'More info',
                    type: 'link',
                    uri: process.env.BASE_URL + '/hotels/' + index
                }]
            };
        });

        items = items.slice(0, 9);
        results = items;

        queue.add(payload.appUser._id, {
            type: 'text',
            text: 'These are the best rated hotels',
            role: 'appMaker'
        });

        queue.add(payload.appUser._id, {
            role: 'appMaker',
            type: 'carousel',
            items
        });
    });
}

function getResult(index) {
    return results[index];
}

module.exports = {
    doSearch, 
    getResult
}