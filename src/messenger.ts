import { Queue } from 'typescript-collections';
import * as WebSocket from 'ws';
import { Message, MessageType } from './message';


/**
 *  A server side messenger that uses websockets to send real time messages to many clients
 * 
 * @class ServerMessenger
 * @extends {Messenger}
 */
export class ServerMessenger {

    public onMessage: (message: Message) => void = () => null;

    private ws: WebSocket.Server;
    private connections = new Map<string, any>();
    private queues = new Map<string, Queue<string>>()
    private handlers = new Map<MessageType, (message: Message) => void>();
    private id = 'server';

    constructor(server: any) {
        this.ws = new WebSocket.Server({ server });
        this.ws.on('error', err => {
            console.error('Server Websocket Error:\n', err);
        })
        this.ws.on('connection', (ws) => {
            ws.on('message', (data) => {
                let msg = JSON.parse(data.toString()) as Message;
                this.connections.set(msg.source, ws);
            });
            ws.on('error', (err) => console.error('client ws error', err));
            this.makeMessageHandler(ws);
        });
        this.addHandeler(MessageType.Connect, (msg) => this.checkQueue(msg.source));
        this.addHandeler(MessageType.Ping, (msg) => null);
    }

    private readMessage(data: any): Message | null {
        try {
            let parsed = JSON.parse(data);
            parsed.type = MessageType[parsed.type];
            return parsed as Message;
        } catch (e) {
            console.error('Could not parse message json got error', e);
            return null;
        }
    }

    private makeMessageHandler(ws: any) {
        ws.on('message', (data: any, flags: any) => {
            let message = this.readMessage(data);
            if (!message) {
                return;
            }
            let cb = this.handlers.get(message.type);
            if (cb) {
                cb(message);
                this.onMessage(message);
            } else {
                console.error('No handler for message type', MessageType[message.type]);
            }
        });
    }

    private makeMessage(messageType: MessageType, data: string | object): string {
        return JSON.stringify({
            type: MessageType[messageType],
            data: data,
            source: this.id
        });
    }

    public addHandeler(messageType: MessageType, callback: (message: Message) => void, context?: any) {
        if (context) {
            callback = callback.bind(context);
        }
        this.handlers.set(messageType, callback);
    }

    private sendMessage(messageType: MessageType, data: string | object, ws: WebSocket): boolean {
        if (ws.readyState !== ws.OPEN)
            return false;
        ws.send(this.makeMessage(messageType, data));
        return true;
    }

    public addQueue(token: string) {
        this.queues.set(token, new Queue<string>());
    }

    public deleteUser(token: string) {
        if (!this.connections.has(token))
            return;
        this.connections.delete(token);
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
            ws.send(queue.dequeue());
        }
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
            if (queue)
                queue.add(msg);
            else
                console.error('Websocket closed with no coresponding queue, message lost');
        }
    }
}
