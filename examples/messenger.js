'use strict';
// Messenger API integration example
// We assume you have:
// * a Wit.ai bot setup (https://wit.ai/docs/quickstart)
// * a Messenger Platform setup (https://developers.facebook.com/docs/messenger-platform/quickstart)
// You need to `npm install` the following dependencies: body-parser, express, request.
//
// 1. npm install body-parser express request 
// 2. Download and install ngrok from https://ngrok.com/download
// 3. ./ngrok http 8445
// 4. WIT_TOKEN=your_access_token FB_PAGE_ID=your_page_id FB_PAGE_TOKEN=your_page_token FB_VERIFY_TOKEN=verify_token node examples/messenger.js
// 5. Subscribe your page to the Webhooks using verify_token and `https://<your_ngrok_io>/fb` as callback URL.
// 6. Talk to your bot on Messenger!

const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');

// When not cloning the `node-wit` repo, replace the `require` like so:
// const Wit = require('node-wit').Wit;
const Wit = require('../').Wit;

// Webserver parameter
const PORT = process.env.PORT || 4000;

// Wit.ai parameters
const WIT_TOKEN = '4JI7FOCUF4BP5GIRVAZKYRUD3QDO52SE';

// Messenger API parameters
const FB_PAGE_ID = 1684272875169324;
if (!FB_PAGE_ID) {
  throw new Error('missing FB_PAGE_ID');
}
const FB_PAGE_TOKEN = 'EAAG75iLWOrEBAKHSPX1sE7oIZC73LQv3TYZCX3fSXLPxNw6vOZAyhzHV5C4aWJEOMEPZB9TdClRv1DEUJ6laqe2pAt5bpUfCBOSsvF1PWBSY8wJKMwrYuZAtZBX4ip4Dhu06DZCYKIyOEciJTk4xgTZAQiLHZBZBtO1Pp6kowjX61CiwZDZD';
if (!FB_PAGE_TOKEN) {
  throw new Error('missing FB_PAGE_TOKEN');
}
const FB_VERIFY_TOKEN = 'VERIFY_TOKEN';

// Messenger API specific code

// See the Send API reference
// https://developers.facebook.com/docs/messenger-platform/send-api-reference
const fbReq = request.defaults({
  uri: 'https://graph.facebook.com/me/messages',
  method: 'POST',
  json: true,
  qs: { access_token: FB_PAGE_TOKEN },
  headers: {'Content-Type': 'application/json'},
});

const fbMessage = (recipientId, msg, cb) => {
  const opts = {
    form: {
      recipient: {
        id: recipientId
      },
      message: {
        text: msg
      }
    }
  };
  fbReq(opts, (err, resp, data) => {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};

// See the Webhook reference
// https://developers.facebook.com/docs/messenger-platform/webhook-reference
const getFirstMessagingEntry = (body) => {
  const val = body.object == 'page' &&
    body.entry &&
    Array.isArray(body.entry) &&
    body.entry.length > 0 &&
    body.entry[0] &&
    body.entry[0].id == FB_PAGE_ID &&
    body.entry[0].messaging &&
    Array.isArray(body.entry[0].messaging) &&
    body.entry[0].messaging.length > 0 &&
    body.entry[0].messaging[0]
  ;
  return val || null;
};

// Wit.ai bot specific code

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

const findOrCreateSession = (fbid) => {
    console.log("im zero");
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }

  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }

  return sessionId;
};
const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
            Array.isArray(entities[entity]) &&
            entities[entity].length > 0 &&
            entities[entity][0].value
        ;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};
// Our bot actions
const actions = {
  say(sessionId, context, message, cb) {
    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to
      console.log(context);
    const recipientId = sessions[sessionId].fbid;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      fbMessage(recipientId, message, (err, data) => {
        if (err) {
          console.log(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err
          );
        }

        // Let's give the wheel back to our bot
        cb();
      });
    } else {
      console.log('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      cb();
    }
  },
  merge(sessionId, context, entities, message, cb) {
      console.log(context);
      console.log(entities);
      console.log(message);

      //Make the merge:
      const hebrewLoc = firstEntityValue(entities, 'hebrewLoc');
      if (hebrewLoc){
          context.hebrewLoc = hebrewLoc;
      }
      const noise = firstEntityValue(entities, 'noiseIntent');
      if (noise){
          context.noise = noise;
          //context.noiseIntent = noise;
      }
      const number = firstEntityValue(entities, 'number');
      if (number){
          context.number = number;
      }
      const garbage = firstEntityValue(entities, 'intent');
      if (garbage){
          context.garbageZur = garbage;
      }
      if (noise && number && !hebrewLoc){
          context.number = undefined;
      }
      console.log("im here");
      console.log(context);
      cb(context);
  },
  error(sessionId, context, error) {
    console.log(error.message);
  },
  fetchRoads(sessionId, context, cb) {
    // Here should go the api call, e.g.:
    // context.forecast = apiCall(context.loc)
    console.log(context);
    context.roadStatus = 'הכל פתוח';
    cb(context);
  },
  cleanGarbage(sessionId, context, cb) {
    console.log("clear garbage");
    console.log(sessions[sessionId].fbid);
    context = {};
    context.done = true;
    cb(context);
  },
  partyPooper(sessionId, context, cb){
      console.log("party pooper");
      let hebrewLoc = context.hebrewLoc;
      let number = context.number;
      context = {};
      context.action =  "  אנחנו נדאג לשלוח פקח ליעד המבוקש"   + " " + hebrewLoc + " " +  number ;
      console.log(context);
      cb(context);
  }
};

// Setting up our bot
const wit = new Wit(WIT_TOKEN, actions);

// Starting our webserver and putting it all together
const app = express();
app.set('port', PORT);
app.listen(app.get('port'));
app.use(bodyParser.json());

// Webhook setup
app.get('/fb', (req, res) => {

  if (!FB_VERIFY_TOKEN) {
    throw new Error('missing FB_VERIFY_TOKEN');
  }
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

// Message handler
app.post('/fb', (req, res) => {
  // Parsing the Messenger API response
 console.log("im here");
  console.log(req.body);
  const messaging = getFirstMessagingEntry(req.body);
  console.log(messaging.recipient.id);
  console.log(messaging.message);

  if (messaging && messaging.message && messaging.recipient.id == FB_PAGE_ID) {

    // Yay! We got a new message!

    // We retrieve the Facebook user ID of the sender
    const sender = messaging.sender.id;

    // We retrieve the user's current session, or create one if it doesn't exist
    // This is needed for our bot to figure out the conversation history
    const sessionId = findOrCreateSession(sender);

    // We retrieve the message content
    const msg = messaging.message.text;
    const atts = messaging.message.attachments;

    if (atts) {
      // We received an attachment

      // Let's reply with an automatic message
      fbMessage(
        sender,
        'Sorry I can only process text messages for now.'
      );
    } else if (msg) {
      // We received a text message

      // Let's forward the message to the Wit.ai Bot Engine
      // This will run all actions until our bot has nothing left to do
      wit.runActions(
        sessionId, // the user's current session
        msg, // the user's message 
        sessions[sessionId].context, // the user's current session state
        (error, context) => {
          if (error) {
            console.log('Oops! Got an error from Wit:', error);
          } else {
              // Our bot did everything it has to do.
              // Now it's waiting for further messages to proceed.
              console.log('Waiting for further messages.');
              // Based on the session state, you might want to reset the session.
              // This depends heavily on the business logic of your bot.
              if (context.done || context.roadStatus || context.action){
                  delete sessions[sessionId]
              } else{
                  // Updating the user's current session state
                  sessions[sessionId].context = context;
              }
          }
        }
      );
    }
  }
  res.sendStatus(200);
});

//TODO: check how to integrate the "alert me".
//977048099078699