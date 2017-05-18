import { getClientMessenger, MessageTypes, Message } from './messenger';
import { Game2P, GameAction, GameActionType, GameEvent } from './game_model/game2p';

import * as readline from 'readline';
import * as debug from 'debug';

const messenger = getClientMessenger();
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
        this.registerCommand('pass', this.pass, ClientState.inGame);
        this.registerCommand('resource', this.playResource, ClientState.inGame);
        this.registerCommand('play', this.playCard, ClientState.inGame);
        this.registerCommand('help', this.help);
        this.registerCommand('exit', (args) => process.exit());
        messenger.addHandeler(MessageTypes.StartGame, this.startGame, this);
        messenger.addHandeler(MessageTypes.GameEvent, (msg) => this.handleGameEvent(msg.data), this);
        messenger.addHandeler(MessageTypes.ClientError, (msg) => console.error('Error:', msg.data), this);
    }

    private handleGameEvent(event: GameEvent) {
        console.log('ev', event);
    }

    private join() {
        messenger.sendMessageToServer(MessageTypes.JoinQueue, (new Date()).toString());
    }

    private playCard(args: string[]) {
        messenger.sendMessageToServer(MessageTypes.GameAction, {
            type: GameActionType.playCard,
            params: {
                toPlay: args[0],
                targets: args.slice(1)
            }
        });
    }

    private startGame(msg: Message) {
        this.gameId = msg.data.gameId;
        console.log('Joined Game with Id', this.gameId);
        console.log('You play', msg.data.playerNumber == 0 ? 'first' : 'second');
        console.log(msg.data.startInfo);
        this.state = ClientState.inGame;
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
        rl.question('> ', (cmd: string) => {
            let parts = cmd.split(' ');
            let handler = this.handlers.get(parts[0]);
            if (handler)
                handler(parts.slice(1));
            else
                console.log('No such cmd as', parts[0]);
            this.prompt();
        });
    }

    public registerCommand(cmd: string, callback: (args: string[]) => void, reqState: ClientState = ClientState.any) {
        this.handlers.set(cmd, (args) => {
            console.log(this.state, reqState);
            if (reqState != ClientState.any && this.state != reqState) {
                console.error('Can\'t run command', cmd, 'in state', ClientState[this.state], 'needs', ClientState[reqState]);
                return;
            }
            callback.bind(this)(args);
        });
    }

}

const cc = new ConsoleClient();
cc.prompt();

