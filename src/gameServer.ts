import { Card } from './game_model/card';

import { ServerMessenger } from './messenger'
import { ErrorType } from './errors'
import { Message, MessageType } from './message';
import { Game, GameAction, GameActionType } from './game_model/game';
import { ServerGame } from './game_model/serverGame';
import { GameFormat, standardFormat } from './game_model/gameFormat';
import { Server } from './server';
import { Account } from './account';

export class GameServer {
    private playerAccounts: Account[] = [];
    private game: ServerGame;
    private id: string;

    constructor(private messenger: ServerMessenger, private server: Server, id: string, player1: Account, player2: Account) {
        ServerGame.setSeed(Math.random());
        this.game = new ServerGame('server', standardFormat, [player1.deck, player2.deck]);
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
        if (events == null) {
            this.server.getErrorHandler().clientError(msg.source, ErrorType.GameActionError,
                'Cannot take action ' + GameActionType[action.type])
            return;
        }
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