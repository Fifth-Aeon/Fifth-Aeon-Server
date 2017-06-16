import { Queue } from 'typescript-collections';
import * as WebSocket from 'ws';


import { MessageType, Message } from '../message';
import { urls } from './url';



// Minimum time before attempting to recconect again;
let minConnectTime = 1000 * 5;
let autoReconenctTime = 1000 * 10;
let pingTime = 1000 * 15;

export class Messenger {
    private handlers: Map<MessageType, (msg: Message) => void>;
    private username: string;
    private id: string;
    private ws: WebSocket;
    private messageQueue: Queue<string> = new Queue<string>();
    private lastConnectAttempt: number;

    private loggedIn: boolean = false;

    public onlogin: (username: string) => void = () => null;
    public connectChange: (status: boolean) => void = () => null;

    constructor() {
        this.handlers = new Map();
        this.id = Math.random().toString(16);
        this.addHandeler(MessageType.LoginResponce, (msg) => this.login(msg));
        this.connect();
        setInterval(() => {
            if (!this.ws || this.ws.readyState === this.ws.OPEN)
                return;
            console.log('Attempting automatic reconnect');
            this.connect();
        }, autoReconenctTime);
        setInterval(() => this.sendMessageToServer(MessageType.Ping, {}), pingTime);
    }

    private connect() {
        if (Date.now() - this.lastConnectAttempt < minConnectTime) {
            return;
        }
        this.lastConnectAttempt = Date.now();
        let url = urls.ws;
        this.ws = new WebSocket(url);
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onopen = () => this.onConnect();
        this.ws.onclose = () => this.connectChange(false);
    }

    private emptyMessageQueue() {
        while (!this.messageQueue.isEmpty()) {
            this.ws.send(this.messageQueue.dequeue());
        }
    }

    private login(msg: Message) {
        this.username = msg.data.username;
        this.id = msg.data.token;
        this.loggedIn = true;
        this.onlogin(this.username);
        this.emptyMessageQueue();
    }


    private onConnect() {
        this.connectChange(true);
        this.sendMessageToServer(MessageType.Connect, {});
        console.log('Connected, requesting queued messages.')
        if (this.loggedIn) {
            this.emptyMessageQueue();
        } else {
            this.annonLogin();
        }
    }

    private annonLogin() {
        this.sendMessageToServer(MessageType.AnonymousLogin, {});
    }


    private handleMessage(ev: MessageEvent) {
        let message = this.readMessage(ev.data);
        if (!message) return;
        let cb = this.handlers.get(message.type);
        console.log(this.handlers);
        if (!(message.data && message.source && message.type)) {
            console.error('Invalid message', message);
            return;
        }
        if (cb) {
            cb(message);
        } else {
            console.error('No handler for message type', MessageType[message.type]);
        }
    }

    private readMessage(data: any): Message | null {
        try {
            let parsed = JSON.parse(data);
            parsed.type = MessageType[parsed.type];
            return parsed as Message;
        } catch (e) {
            console.error('Could not parse message json');
            return null;
        }
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

    public sendMessageToServer(messageType: MessageType, data: string | object) {
        let message = this.makeMessage(messageType, data);
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.send(message);
        } else {
            this.messageQueue.add(message);
            this.connect();
        }
    }
}
