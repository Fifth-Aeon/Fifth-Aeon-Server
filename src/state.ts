import { Game2P } from './game_model/game2p';
import { Account } from './account';
import { getMessenger, MessageTypes } from './messenger';

const messenger = getMessenger(true);

class ServerState {
    games: Map<string, Game2P> = new Map<string, Game2P>();
    accounts: Map<string, Account> = new Map<string, Account>();

    makeGame(token1: string, token2:string) {
        let game = null; //new Game2P();
        let id = Math.random().toString();
        this.games.set(id, game);
        messenger.sendMessageTo(MessageTypes.StartGame, id, token1);
        messenger.sendMessageTo(MessageTypes.StartGame, id, token2);
    }
}

export const state = new ServerState();