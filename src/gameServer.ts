import { Serialize, Deserialize } from 'cerialize'
import { Card } from './game_model/card';

import { ServerMessenger } from './messenger'
import { Message, MessageType } from './message';
import { Game, GameAction } from './game_model/game';
import { GameFormat } from './game_model/gameFormat';
import { Server } from './server';
import { Account } from './account';

export class GameServer {
    private playerAccounts: Account[] = [];
    private game: Game;
    private id: string;

    constructor(private messenger: ServerMessenger, private server: Server, id: string, player1: Account, player2: Account) {
        this.game = new Game(new GameFormat());
        this.id = id;
        this.playerAccounts.push(player1);
        this.playerAccounts.push(player2);
    }

    private playerNum(playerToken: string) {
        return this.playerAccounts.findIndex((acc) => acc.token === playerToken);
    }

    public handleAction(msg: Message) {
        let action: GameAction = msg.data;
        action.player = this.playerNum(msg.source);
        if (action.player === undefined) {
            console.error('Action without player', msg);
            return;
        }
        let events = this.game.handleAction(action);
        this.playerAccounts.forEach(acc => {
            events.forEach(event => {
                this.messenger.sendMessageTo(MessageType.GameEvent, event, acc.token);
            })
        })
        if (this.game.getWinner() != -1) {
            this.end();
        }
    }

    public end() {
        this.server.endGame(this.id);
        this.playerAccounts.forEach(acc => {
            acc.setInGame(null);
        })
    }

    public start() {
        for (let i = 0; i < this.playerAccounts.length; i++) {
            this.messenger.sendMessageTo(MessageType.StartGame, {
                playerNumber: i,
                gameId: this.id,
                opponent: this.playerAccounts[1 - i].username,
            }, this.playerAccounts[i].token);
        }

        let events = this.game.startGame();
        this.playerAccounts.forEach(acc => {
            events.forEach(event => {
                this.messenger.sendMessageTo(MessageType.GameEvent, event, acc.token);
            })
        });
    }

    public getName() {
        return this.playerAccounts[0].username + ' vs ' + this.playerAccounts[1].username;
    }
}