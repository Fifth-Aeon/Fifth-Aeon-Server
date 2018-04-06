import { ServerMessenger } from './messenger';
import { Message, MessageType } from './message';
import { getToken } from './tokens';
import { Account } from './account';
import { GameServer } from './gameServer';
import { MatchQueue } from './matchmaking';
import { ErrorHandeler, ErrorType } from './errors';

import { authRoutes } from './routes/auth';

import * as os from 'os';
import * as morgan from 'morgan';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { db, startDB } from "./db";
import { avalibilityRoutes } from './routes/avalibility';
import { cardRoutes } from './routes/cards';
import { authenticationModel } from './models/authentication.model';
import { NextFunction } from 'express-serve-static-core';

// 1 hour
const cleaningTime = 1000 * 60 * 60 * 60;

/**
 * Server that holds references to all the components of the app
 * 
 * @export
 * @class Server
 */
export class Server {
    private gameQueue: MatchQueue;
    private messenger: ServerMessenger;
    private games: Map<string, GameServer> = new Map<string, GameServer>();
    private accounts: Map<string, Account> = new Map<string, Account>();
    private app: express.Express;
    private errors: ErrorHandeler;

    constructor(port: number) {
        this.app = express();
        this.app.use(bodyParser.json());
        this.addRoutes();
        let expressServer = this.app.listen(port, () => {
            console.log('Server started on port', port);
        });

        this.messenger = new ServerMessenger(expressServer);
        this.errors = new ErrorHandeler(this.messenger);
        this.gameQueue = new MatchQueue(this, this.errors, this.messenger, this.makeGame.bind(this));

        this.messenger.addHandeler(MessageType.SetDeck, (msg) => this.setDeck(msg));
        this.messenger.onMessage = (msg: Message) => {
            let account = this.accounts.get(msg.source);
            if (account)
                account.freshen();
        };

        this.passMessagesToGames();
        setInterval(this.pruneAccounts.bind(this), cleaningTime);
    }

    private async addRoutes() {
        await startDB();
        authenticationModel.setServer(this);
        this.app.use(cors());
        this.app.use(morgan('dev'));
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/availability', avalibilityRoutes);
        this.app.use('/api/cards', cardRoutes);
        this.app.get('/report', (req, res) => {
            res.send(this.getReport());
        });
        this.app.use(this.expressErrorHandler as any);

    }

    private expressErrorHandler(err: Error, req: Request, res: express.Response, next: NextFunction) {
        console.error(err);
        res.status(500)
            .json({
                message: err.message || err.name
            })
    }

    private pruneAccount(acc: Account) {
        console.log('prune', acc.username);
        this.accounts.delete(acc.token);
        this.gameQueue.removeFromQueue(acc.token);
        this.messenger.deleteUser(acc.token);
        if (acc.gameId) {
            let game = this.games.get(acc.gameId);
            if (game) game.end();
        }
    }

    private pruneAccounts() {
        console.log('Pruning acounts');
        let now = Date.now();
        for (let account of this.accounts.values()) {
            let time = (now - account.lastUsed.getTime());
            if (time > cleaningTime) {
                this.pruneAccount(account);
            }
        }
    }


    private getReport() {
        return {
            users: Array.from(this.accounts.values()).map(acc => acc.username),
            games: Array.from(this.games.values()).map(game => game.getName()),
            queue: this.gameQueue.getPlayersInQueue(),
            memory: {
                server: process.memoryUsage(),
                totalFree: os.freemem(),
                totalUsed: os.totalmem()
            }
        };
    }

    public isLoggedIn(token: string): boolean {
        return this.accounts.has(token);
    }

    public createMultiplayerUser(username: string) {
        let existing = Array.from(this.accounts.values()).find(acc => acc.username === username);
        if (existing)
            return existing;

        let token = getToken();
        let account = new Account(token, username);
        this.accounts.set(account.token, account);

        return account;
    }

    private setDeck(msg: Message) {
        let acc = this.accounts.get(msg.source);
        if (!acc) {
            this.errors.clientError(msg.source, ErrorType.AuthError, 'You must be logged in to set your deck.');
            return;
        }
        // Todo validation
        acc.deck.fromJson(msg.data.deckList);
    }


    private passMessagesToGames() {
        this.messenger.addHandeler(MessageType.GameAction, (msg: Message) => {
            let acc = this.accounts.get(msg.source);
            if (!acc) {
                this.errors.clientError(msg.source, ErrorType.GameActionError, "Not logged in.");
                return;
            }
            let id = acc.getGame();

            if (!id || !this.games.has(id)) {
                this.errors.clientError(msg.source, ErrorType.GameActionError, "Not in game.");
                return;
            }
            (this.games.get(id) as GameServer).handleAction(msg);
        });
    }

    public makeGame(token1: string, token2: string) {
        let id = getToken();
        let ac1 = this.accounts.get(token1);
        let ac2 = this.accounts.get(token2);
        if (!ac1 || !ac2)
            return;
        ac1.setInGame(id);
        ac2.setInGame(id);
        let server = new GameServer(this.messenger, this, id, ac1, ac2);
        this.games.set(id, server);
        server.start();
    }

    public endGame(gameId: string) {
        if (this.games.has(gameId))
            this.games.delete(gameId);
        else
            console.error('Trying to delete non-existant game with id', gameId);
    }

    public getErrorHandler() {
        return this.errors;
    }

}


