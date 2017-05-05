import { getClientMessenger, MessageTypes, Message } from './messenger';
import * as readline from 'readline';
import * as debug from 'debug';
const messenger = getClientMessenger();

import { Game2P } from './game_model/game2p';



const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let debugLog = debug('ConsoleClient')


debugLog('Starting Console Client');



class ConsoleClient {
    private handlers: Map<string, (args: string[]) => void> = new Map<string, (args: string[]) => void>();
    private gameId: string = null;

    constructor() {
        messenger.addHandeler(MessageTypes.StartGame, (msg) => {
            this.gameId = msg.data;
            console.log('Joined Game with Id', this.gameId);
        });
        messenger.addHandeler(MessageTypes.SyncState, (msg) => {
            console.log('ss', msg); 
        });
        this.registerCommand('help', (args) => {
            console.log("commands:", this.handlers.keys()); 
        });
        this.registerCommand('exit', (args) => {
            process.exit()
        });
    }

    public prompt() {
        rl.question('?:', (cmd: string) => {
            let parts = cmd.split(' ');
            this.handlers.get(parts[0])(parts.slice(1))

            this.prompt();
        });
    }

    public registerCommand(cmd: string, callback: (args: string[]) => void) {
        this.handlers.set(cmd, callback.bind(this));
    }

}

const cc = new ConsoleClient();

cc.registerCommand('join', (args) => {
    messenger.sendMessageToServer(MessageTypes.JoinQueue, (new Date()).toString());
});

cc.prompt();

