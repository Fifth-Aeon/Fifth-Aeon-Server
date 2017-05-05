import { getServerMessenger, MessageTypes } from './messenger';

import { Account } from './account';
import { Game2P } from './game_model/game2p';

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

    public start() {
        for (let i = 0; i < this.playerAccounts.length; i++) {
            messenger.sendMessageTo(MessageTypes.StartGame, {
                playerNumber: i,
                state: this.game,
                gameId: this.id
            }, this.playerAccounts[i].token);
        }
    }
}