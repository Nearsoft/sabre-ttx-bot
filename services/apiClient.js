const request = require('request-promise-native')
const baseUrl = process.env.API_BASE_URL

function findCity(name) {
    return request.get(baseUrl + '/city_to_code?city=' + name).then(res => {
        res = JSON.parse(res);
        return res[Object.keys(res)[0]];
    });
}

function getHotels(settings) {
    const query = `/get_avail_hotels?check_in=${ settings.checkin }&check_out=${ settings.checkout }&city=${ settings.cityData.city }&rooms=1&guest=1&hotel_options=${ settings.amenities.join(',') }&room_options=${ settings.amenities.join(',') }`;
    return request.get(baseUrl + query ).then(res => {
        res = JSON.parse(res);
        return res;
    });
}

module.exports = {
    findCity,
    getHotels
};