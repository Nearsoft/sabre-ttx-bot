const request = require('request-promise-native')
const baseUrl = process.env.API_BASE_URL

function findCity(name) {
    return request.get(baseUrl + '/city_to_code?city=' + name).then(res => {
        res = JSON.parse(res);
        if (!res[Object.keys(res)[0]]) {
            return null;
        }
        console.log('CITY CODE', res[Object.keys(res)[0]]);
        return res[Object.keys(res)[0]];
    });
}

function getHotels(settings) {
    console.log('SEARCH', settings);
    if (!settings.cityData) {
        return Promise.resolve([]);
    }

    const query = `/get_avail_hotels?check_in=${ settings.checkin }&check_out=${ settings.checkout }&city=${ settings.cityData.iata }&rooms=1&guests=1&hotel_options=${ settings.amenities.join(',') }&room_options=${ settings.amenities.join(',') }`;
    console.log('QUERY SEARCH', query);
    return request.get(baseUrl + query ).then(res => {
        res = JSON.parse(res);
        return res;
    });
}

function getProfile(name) {
    const query = `/get_profile?name=${ name }`;
    return request.get(baseUrl + query ).then(res => {
        res = JSON.parse(res);
        return res;
    });
}

module.exports = {
    findCity,
    getHotels,
    getProfile
};