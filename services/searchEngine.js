const queue = require('../services/messagesWorker');
const apiClient = require('../services/apiClient');

let results = [];

function doSearch(settings, payload) {
    return apiClient.getHotels(settings).then(function (hotels) {
        let items = hotels.map(function (hotel) {
            return {
                title: hotel.name,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a vulputate tortor.',
                mediaUrl: 'http://www.mysincityparty.com/wp-content/uploads/2-052113636163.jpg',
                actions: [{
                    text: 'More info',
                    type: 'link',
                    uri: 'http://example.org'
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