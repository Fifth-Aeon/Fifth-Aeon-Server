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
class Messenger {
    private handlers: Map<string, (Message) => void>;
    private ws;
    private isServer: boolean;
    private name: string;
    private id: string;
    private connections: Map<string, any>;


    constructor(isServer) {
        this.name = isServer ? 'Server' : 'Client';
        this.isServer = isServer;
        console.log('Starting WS', this.name);
        this.connections = new Map<string, any>;

        if (isServer) {
            this.ws = new WebSocket.Server({
                perMessageDeflate: false,
                port: port
            });
            this.id = 'server';
        } else {
            this.ws = new WebSocket('ws://localhost:' + port, {
                perMessageDeflate: false
            });
            this.id = Math.random().toString();
        }

        this.handlers = new Map();

        if (this.isServer) {
            this.ws.on('connection', (ws) => {
                ws.on('message', (data) => {
                    let msg = JSON.parse(data) as Message;
                    if (!this.connections.has(msg.source))
                        this.connections.set(msg.source, ws);
                });
                 this.makeMessageHandler(ws);
            });
        } else {
            this.ws.on('open', () => {
                console.log(this.name + ':', 'Conneciton opened');
            });
             this.makeMessageHandler(this.ws);
        }
       


        console.log(this.name, 'on', port);
    }

    private makeMessageHandler(ws) {
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

    private makeMessage(messageType: string, data: string): string {
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

    private sendMessage(messageType: string, data: string, ws: any) {
        ws.send(this.makeMessage(messageType, data));
    }

    public sendMessageToServer(messageType: string, data: string) {
        this.sendMessage(messageType, data, this.ws);
    }

    public sendMessageTo(messageType: string, data: string, target: string) {
        console.log('sending to', target, this.connections.get(target));
        this.sendMessage(messageType, data, this.connections.get(target));
    }
}


const messengers = {
    client: null,
    server: null
}

export function getMessenger(isServer: boolean): Messenger {
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

