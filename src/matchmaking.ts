import { LinkedDictionary } from 'typescript-collections';
import { getMessenger, MessageTypes, Message } from './messenger';
const messenger = getMessenger(true);

class MatchQueue {
    private playerQueue = new LinkedDictionary<string, number>();

    constructor() {
        messenger.addHandeler(MessageTypes.JoinQueue, this.onJoinQueue, this);
        messenger.addHandeler(MessageTypes.ExitQueue, this.onexitQueue, this);
    }

    public  getPlayersInQueue():number {
        return this.playerQueue.size();
    }

    private onJoinQueue(message: Message ) {
        console.log('ojq', message);
        let playerToken: string = message.data;
        if (this.playerQueue.containsKey(playerToken)) {
            messenger.sendMessage(MessageTypes.InvalidJoinQueue, "Already in queue.");
            return;
        }
        this.playerQueue.setValue(playerToken, 1);
        
    }

    private onexitQueue(message: Message) {
        let playerToken: string = message.data;
        this.playerQueue.remove(playerToken);
    }
}

export const playerQueue = new MatchQueue();
