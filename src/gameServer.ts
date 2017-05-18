import { getServerMessenger, MessageTypes, Message } from './messenger';

import { Account } from './account';
import { Game2P, GameAction } from './game_model/game2p';

const messenger = getServerMessenger();

export class GameServer {
    private playerAccounts: Account[] = [];
    private game: Game2P;
    private id: string;

    constructor(id: string, game: Game2P, player1: Account, player2: Account) {
        this.id = id;
        this.game = game;
        this.playerAccounts.push(player1);
        this.playerAccounts.push(player2);
    }

    private playerNum(playerToken: string) {
        return this.playerAccounts.findIndex((acc) => acc.token === playerToken);
    }

    public handleAction(msg: Message) {
        let action: GameAction = msg.data;
        action.player = this.playerNum(msg.source);
        let events = this.game.handleAction(action);

        this.playerAccounts.forEach(acc => {
            events.forEach(event => {
                messenger.sendMessageTo(MessageTypes.GameEvent, event, acc.token);
            })
        })
    }

    public start() {
        this.game.startGame();
        for (let i = 0; i < this.playerAccounts.length; i++) {
            let playerInfo = this.game.getPlayerSummary(i);
            messenger.sendMessageTo(MessageTypes.StartGame, {
                playerNumber: i,
                startInfo: playerInfo,
                gameId: this.id
            }, this.playerAccounts[i].token);
        }
    }
}