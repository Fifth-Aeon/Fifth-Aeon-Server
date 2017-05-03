import { getClientMessenger, MessageTypes, Message } from './messenger';
const messenger = getClientMessenger();

let debug = require('debug')('cleint');

debug('Starting Console Client');

messenger.addHandeler(MessageTypes.StartGame, (msg) => {
    console.log(msg);
});


// bad, fix lattter
setTimeout(function() {
    console.log('sending');
    messenger.sendMessageToServer(MessageTypes.JoinQueue, (new Date()).toString());
}, 500);

