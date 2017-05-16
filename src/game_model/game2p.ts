import { Dictionary } from 'typescript-collections';
import { Board } from './basic-board';
import { Player } from './player';
import { Card } from './card';
import { Modifier } from './modifier';
import { Entity, Action } from './entity';
import { GameFormat } from './gameFormat';
import { CardGenerator } from './cardGenerator';
import { Resource } from './resource';

let testGen = new CardGenerator();
let recipe = {
    rarityValues: [],
    statsPerPoint: 1
}

enum GamePhase {
    play1, combat, play2, end
}
const game_phase_count = 4;

export enum GameActionType {
    mulligan, playResource, playCard, declareAttackers, declareBlockers, distributeDamage, pass, concede, activateAbility
}

export enum GameEventType {
    attack, turnStart, phaseChange, playResource, mulligan
}

export interface GameAction {
    type: GameActionType,
    player: number,
    params: object
}

export class GameEvent {
    constructor(public type: GameEventType, public params: object) { }
}

type actionCb = (act: GameAction) => boolean;
export class Game2P {
    public id: string;
    private board: Board;
    private turn: number;
    private turnNum: number;
    private players: Player[];
    private modifierLibrary: Dictionary<string, Modifier>;
    private format: GameFormat;
    private phase: GamePhase;
    private actionHandelers: Map<GameActionType, actionCb>
    private events: GameEvent[];

    constructor(format = new GameFormat()) {
        this.format = format;
        this.board = new Board(this.format.playerCount, this.format.boardSize);
        this.turnNum = 1;
        this.actionHandelers = new Map<GameActionType, actionCb>();
        this.players = [
            new Player(testGen.generateCards(recipe, 30), this.format.initalResource[0], this.format.initialLife[0]),
            new Player(testGen.generateCards(recipe, 30), this.format.initalResource[1], this.format.initialLife[1])
        ];
        this.events = [];

        this.addActionHandeler(GameActionType.pass, this.pass);
        this.addActionHandeler(GameActionType.playResource, this.playResource);
    }

    private playResource(act: GameAction): boolean {
        let player = this.players[act.player];
        if (!this.isPlayerTurn(act.player) || !player.canPlayResource())
            return true;
        let res = new Resource();
        player.playResource(res);
        this.addGameEvent(new GameEvent(GameEventType.playResource, { played: res }));
        return false;
    }

    private pass(act: GameAction): boolean {
        if (!this.isPlayerTurn(act.player))
            return false;
        this.nextPhase();
        return true;
    }

    private nextPhase() {
        let curr = this.phase;
        this.phase += 1;
        if (this.phase > game_phase_count) {
            this.nextTurn();
            this.phase = 0;
        }
        this.addGameEvent(new GameEvent(GameEventType.phaseChange, { from: curr, to: this.phase }));
    }

    public addGameEvent(event: GameEvent) {
        this.events.push(event);
    }

    public handleAction(action: GameAction): GameEvent[] {
        console.log('handle', GameActionType[action.type], action.params);
        let mark = this.events.length;
        let sig = this.actionHandelers.get(action.type)(action)
        return this.events.slice(mark);
    }

    public isPlayerTurn(player: number) {
        return this.turn == player;
    }

    private addActionHandeler(type: GameActionType, cb: actionCb) {
        this.actionHandelers.set(type, cb.bind(this));
    }

    public removeEntity(entity: Entity) {
        this.board.removeEntity(entity);
    }

    public getPlayerSummary(playerNum: number): string {
        let currPlayer = this.players[playerNum];
        let otherPlayer = this.players[this.getOtherPlayerNumber(playerNum)];
        let playerBoard = this.board.getPlayerEntities(playerNum).map(entity => entity.toString()).join("\n");
        let enemyBoard = this.board.getPlayerEntities(this.getOtherPlayerNumber(playerNum)).map(entity => entity.toString()).join("\n");
        return `Turn ${this.turnNum} - it is your ${this.isPlayerTurn(playerNum) ? 'turn' : 'opponent\'s turn'}
You have ${currPlayer.getLife()} life and your oponent has ${otherPlayer.getLife()} life.
${currPlayer.sumerize()}
Your Board
${playerBoard}
Enemy Board
${playerBoard}`
    }

    public startGame() {
        this.turn = 0;
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].drawCards(this.format.initialDraw[i]);
        }
        this.players[this.turn].startTurn();
        this.getCurrentPlayerEntities().forEach(entity => entity.refresh());
        this.phase = GamePhase.play1;
    }

    public playEntity(ent: Entity, owner: number) {
        this.addEntity(ent, owner);
    }

    public addEntity(minion: Entity, owner: number) {
        minion.setParent(this);
        this.board.addEntity(minion);
    }

    public getCurrentPlayerEntities() {
        return this.board.getAllEntities().filter(entity => entity.getOwner() == this.turn);
    }

    public getOtherPlayerNumber(playerNum: number): number {
        return (playerNum + 1) % this.players.length
    }

    public nextTurn() {
        this.turn = this.getOtherPlayerNumber(this.turn);
        this.turnNum++;
        let currentPlayerEntities = this.getCurrentPlayerEntities();
        currentPlayerEntities.forEach(entity => entity.refresh());
        this.addGameEvent(new GameEvent(GameEventType.turnStart, { player: this.turn, turnNum: this.turnNum }));
    }
}
