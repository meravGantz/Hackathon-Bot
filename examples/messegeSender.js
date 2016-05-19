'use strict';

// Quickstart example
// See https://wit.ai/l5t/Quickstart

// When not cloning the `node-wit` repo, replace the `require` like so:
// const Wit = require('node-wit').Wit;
const https = require('https');
const querystring = require('querystring');
var postData = JSON.stringify({
    recipient: {
        id: '977048099078699'
    },
    message: {
        text: "Wow i can send you msg without reply."
    }
});
var options = {
    hostname: 'graph.facebook.com',
    path: '/v2.6/me/messages?access_token=EAAG75iLWOrEBAFS0wh83r63S83ZAv0ZC4HCPlbZA75uIDhYA2vRmttsLLJT8vpBfBlRVd1DD55ZChZCAcBjzB9MqnwuX5vbgjlJB1QBGayDmDPAFfDyOnXqeJISOJZAXc5VnQ8uXaNB7rxKDUS7x35hifSoiQ9dYKKoasV4LWS9gZDZD',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
    }
};

var req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.')
    })
});

req.on('error', (e) => {
    console.log(`problem with request: ${e.message} ${e}`);
});

// write data to request body
req.write(postData);
req.end();