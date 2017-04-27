import { LinkedDictionary } from 'typescript-collections';
import { messenger, MessageTypes } from './messenger';

class MatchQueue {
    private playerQueue = new LinkedDictionary<string, number>();

    constructor() {
        messenger.addHandeler(MessageTypes.JoinQueue, this.joinQueue, this);
        messenger.addHandeler(MessageTypes.ExitQueue, this.exitQueue, this);
    }

    joinQueue(playerToken: string) {
        if (this.playerQueue.containsKey(playerToken)) {
            messenger.sendMessage(MessageTypes.InvalidJoinQueue, "Trying to join queue while already in queue.");
            return;
        }
        this.playerQueue.setValue(playerToken, 1);
    }

    exitQueue(playerToken: string) {
        this.playerQueue.remove(playerToken);
    }
}

export const playerQueue = new MatchQueue();
