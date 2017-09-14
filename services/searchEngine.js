const queue = require('../services/messagesWorker');
const apiClient = require('../services/apiClient');

var googleMapsClient = require('@google/maps').createClient({
    key: process.env.GOOGLE_API_KEY
});

let results = [];

function doSearch(settings, payload) {
    googleMapsClient.places({
        query: 'hotel',
        type: 'lodging'
    }, (err, response) => {
        if (err) {
            console.log(err);
            return;
        }

        console.log(response.json.results[0]);
        let promises = response.json.results.map(function (hotel, index) {
            return new Promise((resolve, reject) => {
                if (hotel.photos && hotel.photos.length) {
                    googleMapsClient.placesPhoto({
                        photoreference: hotel.photos[0].photo_reference,
                        maxheight: 100
                    }, (err, response) => {
                        if (err) {
                            console.log(err.status);
                            return;
                        }

                        resolve({
                            title: hotel.name,
                            description: '',
                            mediaUrl: 'https://' + response.client._host + response.client.parser.outgoing.path,
                            phoneNumber: '231123123',
                            address: hotel.formatted_address,
                            price: 100.00,
                            actions: [{
                                text: 'More info',
                                type: 'link',
                                uri: 'https://www.google.com.mx/search?q=' + hotel.name
                            }]
                        });
                    });
                } else {
                    resolve({
                            title: hotel.name,
                            description: '',
                            mediaUrl: hotel.icon,
                            phoneNumber: '231123123',
                            address: hotel.formatted_address,
                            price: 100.00,
                            actions: [{
                                text: 'More info',
                                type: 'link',
                                uri: 'https://www.google.com.mx/search?q=' + hotel.name
                            }]
                        });
                }
            });
        });

        Promise.all(promises).then(items => {
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
        })
    });
}

function getResult(index) {
    return results[index];
}

module.exports = {
    doSearch,
    getResult
}