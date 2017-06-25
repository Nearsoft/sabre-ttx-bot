const express = require('express');
const bodyParser = require('body-parser');
const Smooch = require('smooch-core');
var hbs = require('express-hbs');

const queue = require('./services/messagesWorker');
const searchEngine = require('./services/searchEngine');

const bookingDialog = require('./dialogs/booking');
let step = 0;
const settings = {
    amenities: []
};

const smooch = new Smooch({
    keyId: process.env.SMOOCH_KEY_ID,
    secret: process.env.SMOOCH_SECRET,
    scope: 'app'
});

const LUISClient = require("luis-node-sdk");

var LUISclient = LUISClient({
    appId: process.env.LUIS_APPID,
    appKey: process.env.LUIS_APPKEY,
    verbose: true
});

// LUISclient.predict("may 12", {

//   //On success of prediction
//   onSuccess: function (response) {
//     printOnSuccess(response);
//   },

//   //On failure of prediction
//   onFailure: function (err) {
//     console.error(err);
//   }
// });

var printOnSuccess = function (response) {
    console.log("Query: " + response.query);
    console.log("Top Intent: " + response.topScoringIntent.intent);
    console.log("Entities:", response.entities);
    for (var i = 1; i <= response.entities.length; i++) {
        console.log(i + "- " + response.entities[i - 1].entity);
        // console.log(response.entities[i-1].resolution);
    }
    if (typeof response.dialog !== "undefined" && response.dialog !== null) {
        console.log("Dialog Status: " + response.dialog.status);
        if (!response.dialog.isFinished()) {
            console.log("Dialog Parameter Name: " + response.dialog.parameterName);
            console.log("Dialog Prompt: " + response.dialog.prompt);
        }
    }
};

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'))

app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.get('/', function (req, res) {
    res.send('Hello World!')
});

app.get('/hotels/:index', function (req, res) {
    console.log('/hotels/{index}', searchEngine.getResult(req.params.index));
    res.render('details', {
        hotel: searchEngine.getResult(req.params.index)
    });
});

app.post('/messages', function (req, res) {
    // console.log('webhook PAYLOAD:\n', JSON.stringify(req.body, null, 4));
    console.log(req.body.trigger);
    // return res.end();

    const appUserId = req.body.appUser._id;
    // Call REST API to send message https://docs.smooch.io/rest/#post-message
    if (req.body.trigger === 'message:appUser') {
        LUISclient.predict(req.body.messages[0].text, {
            //On success of prediction
            onSuccess: function (response) {
                console.log('Intent: ' + response.topScoringIntent.intent);

                switch (response.topScoringIntent.intent) {
                    case 'None':
                        queue.add(req.body.appUser._id, {
                            type: 'text',
                            text: `Yikes! I didn’t quite understand that. You can say something like “find a hotel in Las Vegas”.`,
                            role: 'appMaker'
                        });
                        return;
                    case 'Greet':
                        queue.add(req.body.appUser._id, {
                            type: 'text',
                            text: `Hi, ${ req.body.appUser.givenName }! I'm Sherpa and I can help you to find the perfect hotel. Yes, with all the amenities you need. For fun, let’s give it a try.`,
                            role: 'appMaker'
                        });
                        return;
                    case 'SearchHotel':
                        if (!response.entities.length) {
                            return;
                        }
                        step = 1;
                        bookingDialog.methods.setCity(response.entities[0].entity);
                        break;
                    case 'DefineDate':
                        if (step === 2) {
                            bookingDialog.methods.setCheckinDate(response.entities[0].resolution.values[0].value);
                        } else if (step === 3) {
                            bookingDialog.methods.setCheckoutDate(response.entities[0].resolution.values[0].value);
                        }
                        break;
                }

                bookingDialog.steps[step](req.body);
                step = (step + 1) % bookingDialog.steps.length;
                printOnSuccess(response);
            },
            //On failure of prediction
            onFailure: function (err) {
                console.error(err);
            }
        });
    }

    if (req.body.trigger === 'postback') {
        console.log(req.body.postbacks[0].action);
        switch (req.body.postbacks[0].action.payload) {
            case 'EVENT:ADD_AMENITIES':
                console.log('EVENT:ADD_AMENITIES');
                settings.amenities.push(req.body.postbacks[0].text);
                break;
            case 'EVENT:DONE_AMENITIES':
                console.log('EVENT:DONE_AMENITIES');
                queue.add(req.body.appUser._id, {
                    type: 'text',
                    text: `Great! I'm working to find the perfect hotel for you.`,
                    role: 'appMaker'
                });

                const searchSettings = bookingDialog.methods.getSearchSettings();
                searchSettings.amenities = settings.amenities;
                searchEngine.doSearch(searchSettings, req.body);
                break;
        }
    }

    res.end();
});

setInterval(function () {
    message = queue.shift();
    if (message) {
        smooch.appUsers.sendMessage(message.user, message.message).then(() => {
            console.log('RESOLVED!!!!!!!!');
        }).catch((err) => {
            console.log('API ERROR:\n', err);
        });
    }
}, 2000);

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port 3000!')
});