import { playerQueue } from './matchmaking'
import * as WebSocket from 'ws';


export const MessageTypes = {
    // General
    Info: 'Info', // Used to send message out to clients (eg news)
    ClientError: 'ClientError', //  Client did something bad

    // Queuing
    JoinQueue: 'JoinQueue', // Used by a client to join the queue
    ExitQueue: 'ExitQueue', // Used by a client to exit the queue
    
    StartGame: 'StartGame', // Used by server to tell a client a game is ready
    
    // In Game
    SyncState: 'SyncState', // Used by server to send cleint gamestate
    Concede: 'Concede', // Used by client to leave the game, resulting in a loss
    PlayerAction: 'PlayerAction', // Used by client to send a game action
    GetResponce: 'GetResponce', // Used by server to ask client to respond to a game aciton
    GameEvent: 'GameEvent',
    GameAction: 'GameAction'
}

export interface Message {
    source: string;
    type: string;
    data: any;
}

// Todo, make this more dynamic
const port = 2222;

/**
 * Abstract class used to communicate via websockets. Can be used by the client or server. 
 * 
 * @class Messenger
 */
abstract class Messenger {
    protected handlers: Map<string, (Message) => void>;
    protected name: string;
    protected id: string;
    protected connections: Map<string, any>;


    constructor(isServer) {
        this.name = isServer ? 'Server' : 'Client';
        this.connections = new Map<string, any>();
        this.handlers = new Map();

        console.log('Starting WS', this.name);
    }

    protected makeMessageHandler(ws) {
        ws.on('message', (data, flags) => {
            let message = JSON.parse(data) as Message;
            let cb = this.handlers.get(message.type);
            if (cb) {
                cb(message);
            } else {
                console.error('No handler for message type', message.type);
            }
        });
    }

    protected makeMessage(messageType: string, data: string | object): string {
        return JSON.stringify({
            type: messageType,
            data: data,
            source: this.id
        });
    } 

    public addHandeler(messageType, callback: (message: Message) => void, context?: any) {
        if (context) {
            callback = callback.bind(context);
        }
        this.handlers.set(messageType, callback);
    }

    protected sendMessage(messageType: string , data: string | object, ws: any) {
        ws.send(this.makeMessage(messageType, data));
    } 
}

/**
 *  Version of the messenger built to be used by the server.
 * 
 * @class ServerMessenger
 * @extends {Messenger}
 */
class ServerMessenger extends Messenger {
    private ws: WebSocket.Server;

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

    public sendMessageTo(messageType: string, data: string | object, target: string) {
        this.sendMessage(messageType, data, this.connections.get(target));
    }
}

/**
 * Version of the messenger appropriate for use by a (nodejs) client.
 */
class ClientMessenger extends Messenger {
    private ws: WebSocket;

    public sendMessageToServer(messageType: string, data: string | object) {
        console.log('sending', messageType);
        this.sendMessage(messageType, data, this.ws);
    }

    constructor() {
        super(false);

        this.ws = new WebSocket('ws://localhost:' + port);
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

