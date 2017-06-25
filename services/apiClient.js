const request = require('request-promise-native')
const baseUrl = process.env.API_BASE_URL

function findCity(name) {
    return request.get(baseUrl + '/city_to_code?city=' + name).then(res => {
        res = JSON.parse(res);
        return res[Object.keys(res)[0]];
    });
}

function getHotels() {
    return request.get(baseUrl + '/get_avail_hotels' ).then(res => {
        res = JSON.parse(res);
        return res;
    });

    // return new Promise(function (resolve, reject) {
    //     resolve([
    //         {
    //             code: "0073904",
    //             city_code: "LGA",
    //             name: "WINGATE BY WY MANHATTAN MIDTWN",
    //             latitude: "40.752082",
    //             longitude: "-73.991143",
    //             address: " 235 WEST 35TH STREET MANHATTAN NY 10001-1901 ",
    //             phone_number: "1-212-9677500",
    //             fax_number: "1-212-9677599",
    //             price:
    //             {
    //                 min: "259.99",
    //                 max: "199.99"
    //             },
    //             rating: 4.3,
    //             special_offers: "false",
    //             hotel_amenities:
    //             [
    //                 "breakfast",
    //                 "businesscenter",
    //                 "dining",
    //                 "dryclean",
    //                 "fitnesscenter",
    //                 "freelocalcalls",
    //                 "highspeedinternet",
    //                 "meetingfacilities",
    //                 "nonsmoking",
    //                 "rateassured",
    //                 "wheelchair"
    //             ],
    //             room_amenities:
    //             [
    //                 "roomservice"
    //             ],
    //             attractions:
    //             [
    //                 {
    //                     name: "New York City Center Theater",
    //                     rating: "4.5",
    //                     distance: ".07 miles away"
    //                 },
    //                 {
    //                     name: "Bryant Park",
    //                     rating: "4.5",
    //                     distance: ".14 miles away"
    //                 },
    //                 {
    //                     name: "Mint Theater Company",
    //                     rating: "4.5",
    //                     distance: ".13 miles away"
    //                 },
    //                 {
    //                     name: "Macy's Thanksgiving Day Parade",
    //                     rating: "4.5",
    //                     distance: ".10 miles away"
    //                 }
    //             ],
    //             restaurants:
    //             [
    //                 {
    //                     name: "2 Bros Pizza",
    //                     rating: "4.5",
    //                     distance: ".05 miles away"
    //                 },
    //                 {
    //                     name: "Ruth's Chris Steak House",
    //                     rating: "4.5",
    //                     distance: ".01 miles away"
    //                 },
    //                 {
    //                     name: "The Keg Room",
    //                     rating: "4.0",
    //                     distance: ".04 miles away"
    //                 },
    //                 {
    //                     name: "Capizzi",
    //                     rating: "4.5",
    //                     distance: ".06 miles away"
    //                 }

    //             ],
    //             rooms:
    //             [
    //                 "RAC",
    //                 "XPV"
    //             ],
    //             reviews:
    //             [
    //                 {
    //                     title: "Weekend Trip",
    //                     user: "Jamie- Dickey U",
    //                     content: "Hotel is in a good location, although if you are not looking you will miss it. It kinda blends into the street. Got there early, checked luggage, and was offered coffee. Came back in the afternoon to get room, and opened door to room, and it was a mess! Sheets on floor, dirty towels on floor. Turned around, and went back to front desk and was given another room, and front desk person apologized. So no big deal. Was given another room on higher floor which was nice. Room was clean and normal size for NYC. Breakfast in the morning was good, although pancakes and waffles need warmed up, cold in middle. All and all, would stay there again, cause if you are spending all your time in the room, you need to stay home! Roof top bar is cool with a cool view. Would like to go back and experience that when it is warm, went up to get a quick pic. Only big complaint smell of pot in elevator and floor, more comical than a problem. However I am sure that is not what the hotel wants as an image, especially if you are booking families. Dear Jamie- Dickey U, Oh no! So sorry to hear about the mixup with your first room. Our apologies about that one. Additionally, thank you for letting us know about the smell in the elevator. I sincerely appreciate your light heartedness on the issue, however, it's certainly something that will be brought up to management. That aside, I am glad to hear that you enjoyed the higher floor and rooftop views. Isn't it just gorgeous up there? Definitely come back when it gets warmer! It's a wonderful space to be able to enjoy a drink and take in the city. Thanks for taking the time to review– we hope to see you back very soon. Best, Liz from Apple Core Hotels",
    //                     date: "Reviewed March 6, 2017",
    //                     rating: "3.0"
    //                 },
    //                 {
    //                     title: "Great hotel and nice area",
    //                     user: "Chris D",
    //                     content: "Great hotel, Derek was AMAZING!!! Went above and beyond for me and any questions I ask, great service would definitely stay here again Derek made feel like I was at home. The room was really good and the laundry service was great can not fault this place at all really good. Hi Chris D, Thank you for taking the time to review your stay with us at The Lex NYC. It is wonderful to know that you had a fabulous experience with us. We look forward to your return so that we can provide you with yet another fabulous experience. Regards, Omar Sayeed General Manager",
    //                     date: "Reviewed February 9, 2017",
    //                     rating: "5.0"
    //                 },
    //                 {
    //                     title: "Excellent hotel and very central with very helpful staff",
    //                     user: "461Evelyn_F",
    //                     content: "As this was my first time in NY I decided on the Fitzpatrick for my stay and was not disappointed. I would have no hesitation in booking this hotel again or recommending it The bedroom was a nice size and a very comfortable bed. Even though it is located adjacent to a busy street there is no noise at night time Looking forward to returning Dear 461 Evelyn_F, Thank you for staying at the Fitzpatrick Grand Central and for taking the time to post your review of the hotel on Tripadvisor. I am thrilled to see that we were able to make your first visit to the city so enjoyable and you were able a enjoy a good nights rest. Once again, thank you for choosing the Fitzpatrick Grand Central and I do hope it won’t be too long before we have the privilege of welcoming you back to the hotel. Kind Regards, Patrick Leyden General Manager Fitzpatrick Grand Central Hotel",
    //                     date: "Reviewed 1 week ago",
    //                     rating: "4.0"
    //                 },
    //                 {
    //                     title: "lovely stay",
    //                     user: "Angela073",
    //                     content: "The Wellington Hotel; it has an extremely homely feel even in the middle of The City That Never Sleeps.its a 3* hotel From the hotel you can reach Times Square, Central Park and 5th Avenue in less than 10 minutes on foot, Our room/suite was, by New York standards, huge and after a full day of travelling was very welcome. The bed was amazingly comfortable, which coupled with the amount of walking I did each day, meant I slept soundly every night.I was fairly high up, but would still recommend you take earplugs. as you can hear street noise and if you have visited New York before you will know how noisy the streets can be, especially 7th Avenue The decor of myroom was very much in keeping with the lobby area of the hotel, with thick carpets and wallpaper covered walls. I think it’s important to point out that this is not an ultra sleek modern hotel with Ikea style furniture, it is a homely and cozy and most of all comfortable. It is important to remember that The Wellington Hotel is a 3* hotel and even though the hotel is great value for money, you do in reality get what you pay for. The hotel is clean and comfortable, yes it is missing a few facilities and amenities that higher rated hotels may have and it may not be as modern and contemporary as other hotels in the city, This mid range hotel gets big thumbs up, and I will certainly love to stay here again in the future.",
    //                     date: "Reviewed yesterday",
    //                     rating: "5.0"
    //                 }
    //             ]
    //         }
    //     ]);
    // });
}

module.exports = {
    findCity,
    getHotels
};