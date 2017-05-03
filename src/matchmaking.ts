import { LinkedDictionary } from 'typescript-collections';
import { getServerMessenger, MessageTypes, Message } from './messenger';
import { state } from './state';
const messenger = getServerMessenger();

class MatchQueue {
    private playerQueue = new LinkedDictionary<string, number>();

    constructor() {
        messenger.addHandeler(MessageTypes.JoinQueue, this.onJoinQueue, this);
        messenger.addHandeler(MessageTypes.ExitQueue, this.onexitQueue, this);
    }

    public getPlayersInQueue(): number {
        return this.playerQueue.size();
    }

    private makeGame(player1: string, player2: string) {
        this.playerQueue.remove(player1);
        this.playerQueue.remove(player2);
        state.makeGame(player1, player2);
    }

    private searchQueue(playerToken: string) {
        let found = false;
        let other = undefined;
        this.playerQueue.forEach(otherToken => {
            if (found)
                return;
            if (otherToken == playerToken)
                return;
            // Todo: Add logic to filter out inappropiate matchups
            other = otherToken;
            found = true;
        });
        if (other) {
            this.makeGame(playerToken, other);
        }

    }

    private onJoinQueue(message: Message) {
        let playerToken: string = message.source;
        if (this.playerQueue.containsKey(playerToken)) {
            messenger.sendMessageTo(MessageTypes.InvalidJoinQueue, "Already in queue.", playerToken);
            return;
        }
        this.playerQueue.setValue(playerToken, (new Date()).getTime());
        this.searchQueue(playerToken);
    }

    private onexitQueue(message: Message) {
        let playerToken: string = message.source;
        this.playerQueue.remove(playerToken);
    }
}

export const playerQueue = new MatchQueue();
