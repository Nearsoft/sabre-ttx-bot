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

const KEY_ID = 'app_594efaff338749650022c62f';
const SECRET = '4nWtUZO4FEb9l0vJPuW5K4ij';

const smooch = new Smooch({
    keyId: KEY_ID,
    secret: SECRET,
    scope: 'app'
});

const LUISClient = require("luis-node-sdk");

const APPID = "fc9c6c7a-d8c9-4dea-aaa6-1f819ae0818b";
const APPKEY = "779f841f270443f8a3454af60d58e8a4";

var LUISclient = LUISClient({
  appId: APPID,
  appKey: APPKEY,
  verbose: true
});

LUISclient.predict("Hotels in Las Vegas", {

  //On success of prediction
  onSuccess: function (response) {
    printOnSuccess(response);
  },

  //On failure of prediction
  onFailure: function (err) {
    console.error(err);
  }
});

var printOnSuccess = function (response) {
  console.log("Query: " + response.query);
  console.log("Top Intent: " + response.topScoringIntent.intent);
  console.log("Entities:", response.entities);
  for (var i = 1; i <= response.entities.length; i++) {
    console.log(i + "- " + response.entities[i-1].entity);
  }
  if (typeof response.dialog !== "undefined" && response.dialog !== null) {
    console.log("Dialog Status: " + response.dialog.status);
    if(!response.dialog.isFinished()) {
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

app.get('/hotels', function (req, res) {
    res.render('details', {
      title: 'express-hbs example'
    });
});

app.post('/messages', function (req, res) {
    // console.log('webhook PAYLOAD:\n', JSON.stringify(req.body, null, 4));
    console.log(req.body.trigger);
    // return res.end();

    const appUserId = req.body.appUser._id;
    // Call REST API to send message https://docs.smooch.io/rest/#post-message
    if (req.body.trigger === 'message:appUser') {
        bookingDialog[step](req.body);
        step = (step + 1) % bookingDialog.length;
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
                searchEngine.doSearch(req.body);
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

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});