import { Server } from 'net';
import { Context } from 'vm';
import { playerQueue } from './matchmaking'

const WebSocket = require('ws');

export const MessageTypes = {
    JoinQueue: 'JoinQueue',
    ExitQueue: 'ExitQueue',
    InvalidJoinQueue: 'InvalidJoinQueue',
    StartGame: 'StartGame',
    Info: 'Info'
}

export interface Message {
    playerToken: string;
    type: string;
    data: any;
}

const port = 2222;

class Messenger {
    private handlers: Map<string, (Message) => void>;
    private ws;
    private isServer: boolean;
    private name: string;



    constructor(isServer) {
        this.name = isServer ? 'Server' : 'Client';
        this.isServer = isServer;
        console.log('Starting WS', this.name);

        if (isServer) {
            this.ws = new WebSocket.Server({
                perMessageDeflate: false,
                port: port
            });
        } else {
            this.ws = new WebSocket('ws://localhost:' + port, {
                perMessageDeflate: false
            });
        }

        //console.log('ws', this.ws);

        this.handlers = new Map();

        this.ws.on('open', () => {
            console.log(this.name + ':', 'Conneciton opened');
            this.ws.send('Channel Opened');
        });

        this.ws.on('message', (data, flags) => {
            console.log('onMessage', data, flags);
            let message = data as Message;
            console.log('Got a message', message);

            let cb = this.handlers[message.type];
            if (cb) {
                cb(message);
            } else {
                this.sendMessage('UnknownMessageType', 'No handler for message type ' + message.type);
            }
        });

        console.log(this.name, 'on', port);

        if (isServer)
            setInterval(() => this.broadcast(MessageTypes.Info, 'Hello!'), 1000);
    }

    public broadcast(messageType: string, data: string) {
        this.ws.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(this.makeMessage(messageType, data));
            }
        });
    }

    private makeMessage(messageType: string, data: string): string {
        return JSON.stringify({
            type: messageType,
            data: data
        });
    }


    public addHandeler(messageType: string, callback: (message: Message) => void, context?: any) {
        if (context) {
            callback = callback.bind(context);
        }
        this.handlers.set(messageType, callback);
    }

    public sendMessage(messageType: string, data: string) {
        this.ws.send(this.makeMessage(messageType, data));
    }
}


const messengers = {
    client: null,
    server: null
}

export function getMessenger(isServer): Messenger {
    if (isServer) {
        if (!messengers.server)
            messengers.server = new Messenger(true);
        return messengers.server;
    } else {
        if (!messengers.client)
            messengers.client = new Messenger(false);
        return messengers.client;
    }
}

