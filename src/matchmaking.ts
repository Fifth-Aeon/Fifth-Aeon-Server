import { LinkedDictionary } from 'typescript-collections';

import { ServerMessenger } from './messenger';
import { Message, MessageType } from './message';
import { ErrorHandeler, ErrorType } from './errors';
import { Server } from './server';
import { getToken } from './tokens';

export class MatchQueue {
    private playerQueue = new LinkedDictionary<string, number>();
    private privateGames = new Map<string, string>();

    constructor(private server: Server, private errors: ErrorHandeler, private messenger: ServerMessenger, private startGame: (p1:string, p2:string) => void) {
        messenger.addHandeler(MessageType.JoinQueue, this.onJoinQueue, this);
        messenger.addHandeler(MessageType.ExitQueue, this.onExitQueue, this);
        messenger.addHandeler(MessageType.NewPrivateGame, this.newPrivateGame, this);
        messenger.addHandeler(MessageType.JoinPrivateGame, this.joinPrivateGame, this);
        messenger.addHandeler(MessageType.CancelPrivateGame, this.cancelPrivateGame, this);
    }

    private newPrivateGame(message: Message) {
        if (!this.server.isLoggedIn(message.source)) {
            this.messenger.sendMessageTo(MessageType.ClientError, { message: "You must be logged in to start a private game." }, message.source);
            return;
        }
        let token = getToken(16);
        this.privateGames.set(token, message.source);
        this.messenger.sendMessageTo(MessageType.PrivateGameReady, { gameId: token }, message.source);
    }

    private joinPrivateGame(message: Message) {
        if (!this.server.isLoggedIn(message.source)) {
            this.errors.clientError(message.source, ErrorType.AuthError, "Must be logged in");
            return;
        }
        if (!message.data || !message.data.gameId || !this.privateGames.has(message.data.gameId)) {
            this.errors.clientError(message.source, ErrorType.InvalidIdError, "No game with that id.");
            return;
        }
        this.startGame(this.privateGames.get(message.data.gameId) as string, message.source);
        this.privateGames.delete(message.data.gameId);
    }

    private cancelPrivateGame(message: Message) {
        if (!this.server.isLoggedIn(message.source)) {
            this.errors.clientError(message.source, ErrorType.AuthError, "Not Logged in");
            return;
        }
        if (!message.data || !message.data.gameId || !this.privateGames.has(message.data.gameId)) {
            this.errors.clientError(message.source, ErrorType.InvalidIdError, "No game with that id.");
            return;
        }
        this.privateGames.delete(message.data.gameId);
    }

    public getPlayersInQueue(): number {
        return this.playerQueue.size();
    }

    private makeGame(player1: string, player2: string) {
        this.playerQueue.remove(player1);
        this.playerQueue.remove(player2);
        this.startGame(player1, player2);
    }

    public removeFromQueue(token: string) {
        if (this.playerQueue.containsKey(token))
            this.playerQueue.remove(token);
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
        if (!this.server.isLoggedIn(message.source)) {
            this.errors.clientError(message.source, ErrorType.AuthError, "Not logged in.");
        }
        let playerToken: string = message.source;
        if (this.playerQueue.containsKey(playerToken)) {
            this.errors.clientError(message.source, ErrorType.QueueError, "Already in queue");
            return;
        }
        this.playerQueue.setValue(playerToken, (new Date()).getTime());
        this.messenger.sendMessageTo(MessageType.QueueJoined, {}, message.source);
        this.searchQueue(playerToken);
    }

    private onExitQueue(message: Message) {
        let playerToken: string = message.source;
        this.removeFromQueue(playerToken);
    }
}

