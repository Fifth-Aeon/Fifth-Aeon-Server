let count = 1;
export class Account {
    username: string;
    token: string;

    constructor(token: string) {
        this.token = token;
        this.username = 'Player ' + count;
        count++;
    }
}