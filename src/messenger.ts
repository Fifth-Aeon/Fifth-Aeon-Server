import * as WebSocket from 'ws';


import { getToken } from './tokens';
import { Queue } from 'typescript-collections';
import { Message, MessageType } from './message';
import * as express from 'express';

import {parse, stringify} from 'circular-json';


/**
 * Abstract class used to communicate via websockets. Can be used by the client or server. 
 * 
 * @class Messenger
 */
abstract class Messenger {
    protected handlers: Map<MessageType, (message:Message) => void>;
    protected name: string;
    protected id: string;
    public onMessage: (message: Message) => void = () => null;

    constructor(isServer:boolean) {
        this.name = isServer ? 'Server' : 'Client';
        this.handlers = new Map();
    }

    private readMessage(data: any): Message | null {
        try {
            let parsed = parse(data);
            parsed.type = MessageType[parsed.type];
            return parsed as Message;
        } catch (e) {
            console.error('Could not parse message json got error', e);
            return null;
        }
    }

    protected makeMessageHandler(ws:any) {
        ws.on('message', (data:any, flags:any) => {
            let message = this.readMessage(data);
            if (!message) {
                return;
            }
            let cb = this.handlers.get(message.type);
            if (cb) {
                cb(message);
                this.onMessage(message);
            } else {
                console.error('No handler for message type', message.type);
            }
        });
    }

    protected makeMessage(messageType: MessageType, data: string | object): string {
        return stringify({
            type: MessageType[messageType],
            data: data,
            source: this.id
        });
    }

    public addHandeler(messageType:MessageType, callback: (message: Message) => void, context?: any) {
        if (context) {
            callback = callback.bind(context);
        }
        this.handlers.set(messageType, callback);
    }


    protected sendMessage(messageType: MessageType, data: string | object, ws: WebSocket): boolean {
        if (ws.readyState !== ws.OPEN)
            return false;
        ws.send(this.makeMessage(messageType, data));
        return true;
    }
}

/**
 *  Version of the messenger built to be used by the server.
 * 
 * @class ServerMessenger
 * @extends {Messenger}
 */
export class ServerMessenger extends Messenger {
    private ws: WebSocket.Server;
    protected connections: Map<string, any>;
    protected queues: Map<string, Queue<string>>;

    constructor(server:any) {
        super(true);
        this.connections = new Map<string, any>();
        this.queues = new Map<string, Queue<string>>();
        this.ws = new WebSocket.Server({ server });
        this.id = 'server';
        this.ws.on('connection', (ws) => {
            ws.on('message', (data) => {
                let msg = parse(data.toString()) as Message;
                this.connections.set(msg.source, ws);
            });
            this.makeMessageHandler(ws);
        });
        this.addHandeler(MessageType.Connect, (msg) => this.checkQueue(msg.source));
        this.addHandeler(MessageType.Ping, (msg) => null);
    }

    public addQueue(token: string) {
        this.queues.set(token, new Queue<string>());
    }

    public deleteUser(token: string) {
        if (this.connections.has(token))
            this.connections.delete(token);
        if (this.connections.has(token))
            this.queues.delete(token);
    }

    /**
     * Check if we have any unsent messagess to send to a client
     * @param token - The client's id
     */
    private checkQueue(token: string) {
        let queue = this.queues.get(token);
        if (!queue)
            return;
        let ws = this.connections.get(token);
        while (!queue.isEmpty()) {
            console.log('sending enqued message');
            ws.send(queue.dequeue());
        }
    }

    public changeToken(oldToken: string, newToken: string) {
        let temp = this.connections.get(oldToken);
        this.connections.delete(oldToken);
        this.connections.set(newToken, temp);
    }

    /**
     * Send message from server to all clients
     * 
     * @param {string} messageType 
     * @param {string} data 
     * 
     * @memberOf Messenger
     */
    public broadcast(messageType: MessageType, data: string) {
        this.ws.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(this.makeMessage(messageType, data));
            }
        });
    }

    /**
     * Send a message to a user. If the conneciton is closed, but the user is logged in
     * the message will be enqued. If the user then reconnects, the queued message will
     * be sent
     * 
     * @param {MessageType} messageType - The type of message to send
     * @param {(string | object)} data - The data contined within the message
     * @param {string} target - The id of the user to send the message to
     * 
     * @memberof ServerMessenger
     */
    public sendMessageTo(messageType: MessageType, data: object, target: string) {
        let ws = this.connections.get(target);
        let msg = this.makeMessage(messageType, data)
        if (ws.readyState === ws.OPEN) {
            ws.send(msg);
        } else {
            let queue = this.queues.get(target)
            if (queue) {
                queue.add(msg);
            } else
                console.error('ws closed, message lost');
        }
    }
}
