'use strict';

// Quickstart example
// See https://wit.ai/l5t/Quickstart

// When not cloning the `node-wit` repo, replace the `require` like so:
// const Wit = require('node-wit').Wit;
const http = require('http');
const querystring = require('querystring');
function sendMeteor(path, methodType ,postData, cb){
    var options = {
        hostname: 'https://46fc683c.ngrok.io',
        path: '/' + path,
        method: methodType,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    var req = http.request(options, (res) => {
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
}
var unkownData = JSON.stringify({
    question: "איזה כיף שאתה מציק לי",
    user_fb_id: '977048099078699',
    sessionId: "324324"
});
var processData = JSON.stringify({
    processType: "garbage",
    location: "זבולון",
    userId: '977048099078695'
});
sendMeteor('/clean-garbage', 'POST', processData);
