let count = 1;
export class Account {
    username: string;
    token: string;
    gameId: string;

    constructor(token: string) {
        this.token = token;
        this.username = 'Player ' + count;
        this.gameId = null;
        count++;
    }

    setInGame(gameId: string) {
        this.gameId = gameId;
    }

    getGame() {
        return this.gameId;
    }
}