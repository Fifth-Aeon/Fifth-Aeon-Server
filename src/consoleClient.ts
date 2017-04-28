import { getMessenger, MessageTypes, Message } from './messenger';
const messenger = getMessenger(false);

let debug = require('debug')('cleint');


debug('Starting Console Client');


let myId: string = Math.random().toString();

messenger.addHandeler(MessageTypes.StartGame, (msg) => {
    console.log(msg);
});


// bad, fix lattter
setTimeout(function() {
    console.log('sending');
    messenger.sendMessage(MessageTypes.JoinQueue, myId);
}, 500);

