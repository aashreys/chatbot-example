'use strict';

// default replies
const REPLY_ERROR               = "An error has occured. Please try again.";
const REPLY_DID_NOT_UNDERSTAND  = "I didn't understand that. Can you rephrase?";
const REPLY_SUCCESSFUL          = "I understood your message. You can tailor my responses to your messages by analysing the metadata attached with this message.";

// services
const express       = require('express');
const app           = express();
const server        = require('http').Server(app);
const io            = require('socket.io')(server);
const classifier    = require('./nlu/classifier.js');

// models
const Reply = require('./reply.js')

// socket.io channels 
const messageChannel  = 'message';
const replyChannel    = 'reply';

app.get('/', function(req, res) {
    res.send("Hello World!");
});

io.on('connection', function(socket) {
    console.log("Connected to Chatbot");
    socket.on(messageChannel, function(message) {
        console.log("Chatbot received a message saying: ", message.message);
        classifier.parse(message.message, function(error, intent, entities) {
            if (error) {
                socket.emit(replyChannel, "An error has occurred: " + error);
            } else {
                var reply = intent ? REPLY_SUCCESSFUL : REPLY_DID_NOT_UNDERSTAND;
                socket.emit(replyChannel, new Reply(message, reply, intent, entities).toJson());
            }
        });
    });
});

server.listen(3000, function () {
  console.log('Chatbot is listening on port 3000!')
});