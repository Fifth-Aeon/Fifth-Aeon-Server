import { Game2P } from './game_model/game2p';
import { Account } from './account';
import { getServerMessenger, MessageTypes } from './messenger';

import { GameServer} from './gameServer';

const messenger = getServerMessenger();

class ServerState {
    private games: Map<string, GameServer> = new Map<string, GameServer>();
    private accounts: Map<string, Account> = new Map<string, Account>();

    public makeGame(token1: string, token2:string) {
        if (!this.accounts.has(token1))
            this.accounts.set(token1, new Account(token1))
        if (!this.accounts.has(token2))
            this.accounts.set(token2, new Account(token2))



        let id = Math.random().toString();
        let game = new Game2P();
        let server =  new GameServer(id, game, this.accounts.get(token1), this.accounts.get(token2));
        this.games.set(id, server);

        server.start();
    }
}

export const state = new ServerState();