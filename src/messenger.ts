import { Context } from 'vm';
import { playerQueue } from './matchmaking'

const WebSocket = require('ws');

export const MessageTypes = {
    JoinQueue: 'JoinQueue',
    ExitQueue: 'ExitQueue',
    InvalidJoinQueue: 'InvalidJoinQueue'
}

export interface Message {
    playerToken: string;
    type: string;
    data: any;
}

class Messenger {
    private handlers: Map<string, (Message) => void>;
    private ws;

    public addHandeler(messageType: string, callback: (Message) => void, context?: any) {
        if (context) {
            callback = callback.bind(context);
        }
        this.handlers.set(messageType, callback);
    }

    public sendMessage(messageType: string, data: string) {
        this.ws.send(JSON.stringify({
            type: messageType,
            data: data
        }))
    }

    constructor() {
        this.ws = new WebSocket.Server({
            perMessageDeflate: false,
            port: 8080
        });

        this.ws.on('open', function open() {
            this.ws.send('Channel Opened');
        });

        this.ws.on('message', function incoming(data, flags) {
            let message = data as Message;
            let cb = this.handlers[message.type];
            if (cb) {
                cb(message);
            } else {
                this.sendMessage('UnknownMessageType', 'No handler for message type ' + message.type);
            }
        });
    }

}


export const messenger = new Messenger();

