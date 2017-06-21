import { Board } from './board';
import { Player } from './player';
import { Card } from './card';
import { Unit } from './unit';
import { GameFormat } from './gameFormat';
import { Resource } from './resource';
import { GameEvent, EventType } from './gameEvent';
import { data } from './gameData';

import { Serialize, Deserialize } from 'cerialize';

enum GamePhase {
    play1, combat, play2, end, responceWindow
}

const game_phase_count = 4;

export enum GameActionType {
    mulligan, playResource, playCard, pass, concede, activateAbility,
    declareAttackers, declareBlockers, distributeDamage,
    declareTarget, Quit
}

export enum GameEventType {
    attack, turnStart, phaseChange, playResource, mulligan, playCard, block
}

export interface GameAction {
    type: GameActionType,
    player: number,
    params: any
}

export class SyncGameEvent {
    constructor(public type: GameEventType, public params: object) { }
}

type actionCb = (act: GameAction) => boolean;
export class Game {
    // Id of the game on the server
    public id: string;
    // A board containing units in play
    private board: Board;
    // The number of player whose turn it currently is
    private turn: number;
    // The number of turns that have passed from the games start
    private turnNum: number;
    // The players playing the game
    private players: Player[];
    // The format of the game
    private format: GameFormat;
    // The phase of the current players turn (eg main phase, attack phase)
    private phase: GamePhase;
    // The previous phase (used to return from responce phases)
    private lastPhase: GamePhase;
    // A table of handlers used to respond to actions taken by players
    private actionHandelers: Map<GameActionType, actionCb>
    // A list of all events that have taken place this game and need to be sent to clients
    private events: SyncGameEvent[];
    // A list of  units currently attacking
    private attackers: Unit[];
    // A list of blocks by the defending player
    private blockers: [Unit, Unit][];

    /**
     * Constructs a game given a format. The format
     * informs how the game is initlized eg how
     * much health each player starts with.
     * 
     * @param {any} [format=new GameFormat()] 
     * @memberof Game
     */
    constructor(format = new GameFormat()) {
        this.format = format;
        this.board = new Board(this.format.playerCount, this.format.boardSize);
        this.turnNum = 1;
        this.actionHandelers = new Map<GameActionType, actionCb>();
        this.players = [
            new Player(data.getRandomDeck(format.minDeckSize), 0, this.format.initalResource[0], this.format.initialLife[0]),
            new Player(data.getRandomDeck(format.minDeckSize), 1, this.format.initalResource[1], this.format.initialLife[1])
        ];
        this.events = [];
        this.attackers = [];
        this.blockers = [];

        this.addActionHandeler(GameActionType.pass, this.pass);
        this.addActionHandeler(GameActionType.playResource, this.playResource);
        this.addActionHandeler(GameActionType.playCard, this.playCard);
        this.addActionHandeler(GameActionType.declareAttackers, this.declareAttackers);
        this.addActionHandeler(GameActionType.declareBlockers, this.declareBlockers);
    }

    // Syncronization --------------------------------------------------------

    /**
     * Syncs an event that happened on the server into the state of this game model
     * 
     * @param {number} playerNumber 
     * @param {SyncGameEvent} event 
     * @memberof Game
     */
    public syncServerEvent(playerNumber: number, event: SyncGameEvent) {
        // TODO
    }

    /**
     * 
     * Handles a players action and returns a list of events that
     * resulted from that aciton.
     * 
     * @param {GameAction} action 
     * @returns {SyncGameEvent[]} 
     * @memberof Game
     */
    public handleAction(action: GameAction): SyncGameEvent[] {
        let mark = this.events.length;
        let handeler = this.actionHandelers.get(action.type);
        if (!handeler)
            return [];
        let sig = handeler(action);
        return this.events.slice(mark);
    }

    private addActionHandeler(type: GameActionType, cb: actionCb) {
        this.actionHandelers.set(type, cb.bind(this));
    }


    // Game Logic --------------------------------------------------------

    public startGame() {
        this.turn = 0;
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].drawCards(this.format.initialDraw[i]);
        }
        this.players[this.turn].startTurn();
        this.getCurrentPlayerEntities().forEach(unit => unit.refresh());
        this.phase = GamePhase.play1;
    }

    private resolveCard(query: string, player: Player): Card | null {
        return player.queryHand(query);
    }

    private resolvePlayerUnit(query: string, player: Player): Unit {
        let options = this.board.getPlayerEntities(player.getPlayerNumber());
        return player.queryCards(query, options) as Unit;
    }

    private playCard(act: GameAction): boolean {
        let player = this.players[act.player];
        if (!this.isPlayerTurn(act.player))
            return false;
        let card = this.resolveCard(act.params.toPlay, player);
        if (!card)
            return false;
        this.addGameEvent(new SyncGameEvent(GameEventType.playCard, { played: Serialize(card) }));
        player.playCard(this, card);
        return true;
    }

    private declareAttackers(act: GameAction): boolean {
        let player = this.players[act.player];
        if (!this.isPlayerTurn(act.player) || this.phase !== GamePhase.play1)
            return false;
        this.attackers = act.params['attackers']
            .map((query: string) => this.resolvePlayerUnit(query, player))
            .filter((unit: Unit) => unit);
        this.phase = GamePhase.combat
        this.addGameEvent(new SyncGameEvent(GameEventType.attack, { attacking: this.attackers.map(e => e.toString()) }));
        return true;
    }

    private declareBlockers(act: GameAction) {
        let player = this.players[act.player];
        let op = this.players[this.getOtherPlayerNumber(act.player)];
        if (this.isPlayerTurn(act.player) || this.phase !== GamePhase.combat)
            return false;
        this.blockers = act.params['blockers']
            .map((block: any) => [
                this.resolvePlayerUnit(block[0], op),
                this.resolvePlayerUnit(block[1], player)
            ])
            .filter((block: [Unit, Unit]) => block[0] && block[1]);
        this.addGameEvent(new SyncGameEvent(GameEventType.block, { blocks: this.blockers.map(b => b.map(e => e.toString())) }));
        this.resolveCombat();
        return true;
    }

    private playResource(act: GameAction): boolean {
        let player = this.players[act.player];
        if (!this.isPlayerTurn(act.player) || !player.canPlayResource())
            return true;
        let res = new Resource();
        player.playResource(res);
        this.addGameEvent(new SyncGameEvent(GameEventType.playResource, { played: res }));
        return false;
    }

    private pass(act: GameAction): boolean {
        if (!this.isPlayerTurn(act.player))
            return false;
        this.nextPhase(act.player);
        return true;
    }

    private resolveCombat() {
        this.phase = GamePhase.play2;
    }

    private nextPhase(player: number) {
        let curr = this.phase;
        switch (this.phase) {
            case GamePhase.play1:
                this.nextTurn();
                break;
            case GamePhase.play2:
                this.nextTurn();
                break;
            case GamePhase.combat:
                if (!this.isPlayerTurn(player))
                    this.resolveCombat();
                break;
        }
    }

    public addGameEvent(event: SyncGameEvent) {
        this.events.push(event);
    }

    public isPlayerTurn(player: number) {
        return this.turn === player;
    }

    public removeUnit(unit: Unit) {
        this.board.removeUnit(unit);
    }

    public playUnit(ent: Unit, owner: number) {
        this.addUnit(ent, owner);
    }

    public addUnit(unit: Unit, owner: number) {
        unit.getEvents().addEvent(null, new GameEvent(EventType.onDamaged, (params) => {
            this.removeUnit(unit);
            return params;
        }));
        this.board.addUnit(unit);
    }

    public nextTurn() {
        this.turn = this.getOtherPlayerNumber(this.turn);
        this.turnNum++;
        let currentPlayerEntities = this.getCurrentPlayerEntities();
        currentPlayerEntities.forEach(unit => unit.refresh());
        this.addGameEvent(new SyncGameEvent(GameEventType.turnStart, { player: this.turn, turnNum: this.turnNum }));
        this.attackers = [];
        this.blockers = [];
    }

    // Getters and setters ---------------------------------------------------

    public getPlayer(playerNum: number) {
        return this.players[playerNum];
    }

    public getBoard() {
        return this.board;
    }

    public getCurrentPlayerEntities() {
        return this.board.getAllEntities().filter(unit => this.isPlayerTurn(unit.getOwner().getPlayerNumber()));
    }

    public getOtherPlayerNumber(playerNum: number): number {
        return (playerNum + 1) % this.players.length
    }

    /**
    * 
    * Returns the number of the player who has won the game.
    * If it is still in progress it will return -1;
    * 
    * @returns 
    * @memberof Game
    */
    public getWinner() {
        // TODO, check for winner
        return -1;
    }
}
