import { getClientMessenger, MessageTypes, Message } from './messenger';
import * as readline from 'readline';
import * as debug from 'debug';
const messenger = getClientMessenger();

import { Game2P, GameAction, GameActionType, GameEvent } from './game_model/game2p';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

enum ClientState {
    inGame, inLobby, any
}

class ConsoleClient {
    private handlers: Map<string, (args: string[]) => void> = new Map<string, (args: string[]) => void>();
    private gameId: string = null;
    private state: ClientState = ClientState.inLobby;

    constructor() {
        this.registerCommand('join', this.join, ClientState.inLobby);
        this.registerCommand('pass', this.pass);
        this.registerCommand('resource', this.playResource);
        this.registerCommand('help', this.help);
        this.registerCommand('exit', (args) => {
            process.exit()
        });

        messenger.addHandeler(MessageTypes.StartGame, this.startGame, this);
        messenger.addHandeler(MessageTypes.GameEvent, (msg) => this.handleGameEvent(msg.data), this);
    }

    private handleGameEvent(event: GameEvent) {
        console.log('ev', event);
    }

    private join() {
        messenger.sendMessageToServer(MessageTypes.JoinQueue, (new Date()).toString());
    }

    private startGame(msg: Message) {
        console.log(msg);
        this.gameId = msg.data.gameId;
        console.log('Joined Game with Id', this.gameId);
        console.log('You play', msg.data.playerNumber == 0 ? 'first' : 'second');
        this.state = ClientState.inGame;
        console.log(msg.data.startInfo);
    }

    private pass() {
        messenger.sendMessageToServer(MessageTypes.GameAction, {
            type: GameActionType.pass
        } as GameAction)
    }

    private playResource() {
        messenger.sendMessageToServer(MessageTypes.GameAction, {
            type: GameActionType.playResource
        } as GameAction)
    }

    private help() {
        console.log("commands:", this.handlers.keys());
    }


    public prompt() {
        rl.question('?:', (cmd: string) => {
            let parts = cmd.split(' ');
            this.handlers.get(parts[0])(parts.slice(1))
            this.prompt();
        });
    }

    public registerCommand(cmd: string, callback: (args: string[]) => void, reqState: ClientState = ClientState.any) {
        this.handlers.set(cmd, (args) => {
            console.log(this.state, reqState);
            if (reqState != ClientState.any && this.state != reqState) {
                console.error('Can\'t run command', cmd, 'in state', ClientState[this.state]);
            }
            callback.bind(this)(args);
        });
    }

}

const cc = new ConsoleClient();
cc.prompt();

