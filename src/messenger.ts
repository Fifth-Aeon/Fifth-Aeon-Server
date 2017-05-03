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
    source: string;
    type: string;
    data: any;
}

// Todo, make this more dynamic
const port = 2222;

/**
 * Object used to communicate via websockets. Can be used by the client or server. 
 * 
 * @class Messenger
 */
abstract class Messenger {
    protected handlers: Map<string, (Message) => void>;
    protected ws;
    protected isServer: boolean;
    protected name: string;
    protected id: string;
    protected connections: Map<string, any>;


    constructor(isServer) {
        this.name = isServer ? 'Server' : 'Client';
        this.isServer = isServer;
        this.connections = new Map<string, any>();
        this.handlers = new Map();

        console.log('Starting WS', this.name);
    }

    protected makeMessageHandler(ws) {
        ws.on('message', (data, flags) => {
            console.log('onMessage', data, flags);
            let message = JSON.parse(data) as Message;
            console.log('Got a message', message);

            let cb = this.handlers.get(message.type);
            if (cb) {
                cb(message);
            } else {
                console.error('No handler for message type', message.type, 'raw:', data, 'parsed:', message.type, message.data);
            }
        });
    }



    protected makeMessage(messageType: string, data: string): string {
        return JSON.stringify({
            type: messageType,
            data: data,
            source: this.id
        });
    }


    public addHandeler(messageType: string, callback: (message: Message) => void, context?: any) {
        if (context) {
            callback = callback.bind(context);
        }
        this.handlers.set(messageType, callback);
    }

    protected sendMessage(messageType: string, data: string, ws: any) {
        ws.send(this.makeMessage(messageType, data));
    }


}

class ServerMessenger extends Messenger {
    constructor() {
        super(true);
        this.ws = new WebSocket.Server({
            perMessageDeflate: false,
            port: port
        });
        this.id = 'server';
        this.ws.on('connection', (ws) => {
            ws.on('message', (data) => {
                let msg = JSON.parse(data) as Message;
                if (!this.connections.has(msg.source))
                    this.connections.set(msg.source, ws);
            });
            this.makeMessageHandler(ws);
        });
    }

    /**
     * Send Mesage from server to all clients
     * 
     * @param {string} messageType 
     * @param {string} data 
     * 
     * @memberOf Messenger
     */
    public broadcast(messageType: string, data: string) {
        this.ws.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(this.makeMessage(messageType, data));
            }
        });
    }

    public sendMessageTo(messageType: string, data: string, target: string) {
        console.log('sending to', target, this.connections.get(target));
        this.sendMessage(messageType, data, this.connections.get(target));
    }
}

class ClientMessenger extends Messenger {

    public sendMessageToServer(messageType: string, data: string) {
        this.sendMessage(messageType, data, this.ws);
    }

    constructor() {
        super(false);

        this.ws = new WebSocket('ws://localhost:' + port, {
            perMessageDeflate: false
        });
        this.id = Math.random().toString();
        this.ws.on('open', () => {
            console.log(this.name + ':', 'Conneciton opened');
        });
        this.makeMessageHandler(this.ws);
    }

}


const messengers = {
    client: null,
    server: null
}

export function getServerMessenger(): ServerMessenger {
    if (!messengers.server)
        messengers.server = new ServerMessenger();
    return messengers.server;
}

export function getClientMessenger(): ClientMessenger {
    if (!messengers.client)
        messengers.client = new ClientMessenger();
    return messengers.client;
}

