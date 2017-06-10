import { NameGenerator } from './nameGenerator';

let ng = new NameGenerator();

export class Account {
    username: string;
    token: string;
    gameId: string;
    lastUsed: Date;

    constructor(token: string, name: string) {
        this.token = token;
        this.username = name || ng.getName();
        this.gameId = null;
        this.freshen();
    }

    public freshen() {
        this.lastUsed = new Date();
    }

    public setInGame(gameId: string) {
        this.gameId = gameId;
    }

    public getGame() {
        return this.gameId;
    }
}
