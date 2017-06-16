import { Dictionary } from 'typescript-collections';
import { Board } from './board';
import { Player } from './player';
import { Card } from './card';
import { Modifier } from './modifier';
import { Unit, Action } from './unit';
import { GameFormat } from './gameFormat';
import { CardGenerator } from './cardGenerator';
import { Resource } from './resource';

let testGen = new CardGenerator();
let recipe = {
    rarityValues: [],
    statsPerPoint: 1
}

enum GamePhase {
    play1, combat, play2, end, responceWindow
}


const game_phase_count = 4;

export enum GameActionType {
    mulligan, playResource, playCard, declareAttackers, declareBlockers, distributeDamage, pass, concede, activateAbility
}

export enum GameEventType {
    attack, turnStart, phaseChange, playResource, mulligan, playCard, block
}

export interface GameAction {
    type: GameActionType,
    player: number,
    params: any
}

export class GameEvent {
    constructor(public type: GameEventType, public params: object) { }
}

type actionCb = (act: GameAction) => boolean;
export class Game {
    public id: string;
    private board: Board;
    private turn: number;
    private turnNum: number;
    private players: Player[];
    private modifierLibrary: Dictionary<string, Modifier>;
    private format: GameFormat;
    private phase: GamePhase;
    private lastPhase: GamePhase;
    private actionHandelers: Map<GameActionType, actionCb>
    private events: GameEvent[];
    private attackers: Unit[];
    private blockers: [Unit, Unit][];


    constructor(format = new GameFormat()) {
        this.format = format;
        this.board = new Board(this.format.playerCount, this.format.boardSize);
        this.turnNum = 1;
        this.actionHandelers = new Map<GameActionType, actionCb>();
        this.players = [
            new Player(testGen.generateCards(recipe, 30), 0, this.format.initalResource[0], this.format.initialLife[0]),
            new Player(testGen.generateCards(recipe, 30), 1, this.format.initalResource[1], this.format.initialLife[1])
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

    public getWinner() {
        return -1;
    }

    private resolveCard(query: string, player: Player): Card | null {
        return player.queryHand(query);
    }

    private resolvePlayerUnity(query: string, player: Player): Unit {
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
        this.addGameEvent(new GameEvent(GameEventType.playCard, { played: card.toJson() }));
        player.playCard(this, card);
        return true;
    }

    private declareAttackers(act: GameAction): boolean {
        let player = this.players[act.player];
        if (!this.isPlayerTurn(act.player) || this.phase !== GamePhase.play1)
            return false;
        this.attackers = act.params['attackers']
            .map((query: string) => this.resolvePlayerUnity(query, player))
            .filter((unit: Unit) => unit);
        console.log(act.params['attackers'], this.attackers);
        this.phase = GamePhase.combat
        this.addGameEvent(new GameEvent(GameEventType.attack, { attacking: this.attackers.map(e => e.toJson()) }));
        return true;
    }

    private declareBlockers(act: GameAction) {
        let player = this.players[act.player];
        let op = this.players[this.getOtherPlayerNumber(act.player)];
        if (this.isPlayerTurn(act.player) || this.phase !== GamePhase.combat)
            return false;
        this.blockers = act.params['blockers']
            .map((block: any) => [
                this.resolvePlayerUnity(block[0], op),
                this.resolvePlayerUnity(block[1], player)
            ])
            .filter((block: [Unit, Unit]) => block[0] && block[1]);
        this.addGameEvent(new GameEvent(GameEventType.block, { blocks: this.blockers.map(b => b.map(e => e.toJson())) }));
        this.resolveCombat();
        return true;
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

    public addGameEvent(event: GameEvent) {
        this.events.push(event);
    }

    public handleAction(action: GameAction): GameEvent[] {
        console.log('handle', GameActionType[action.type], action.params);
        let mark = this.events.length;
        let handeler = this.actionHandelers.get(action.type);
        if (!handeler)
            return [];
        let sig = handeler(action);
        return this.events.slice(mark);
    }

    public isPlayerTurn(player: number) {
        return this.turn === player;
    }

    private addActionHandeler(type: GameActionType, cb: actionCb) {
        this.actionHandelers.set(type, cb.bind(this));
    }

    public removeUnit(unit: Unit) {
        this.board.removeUnit(unit);
    }

    public getPlayerSummary(playerNum: number): string {
        let currPlayer = this.players[playerNum];
        let otherPlayer = this.players[this.getOtherPlayerNumber(playerNum)];
        let playerBoard = this.board.getPlayerEntities(playerNum).map(unit => unit.toString()).join("\n");
        let enemyBoard = this.board.getPlayerEntities(this.getOtherPlayerNumber(playerNum)).map(unit => unit.toString()).join("\n");
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
        this.getCurrentPlayerEntities().forEach(unit => unit.refresh());
        this.phase = GamePhase.play1;
    }

    public playUnit(ent: Unit, owner: number) {
        this.addUnit(ent, owner);
    }

    public addUnit(minion: Unit, owner: number) {
        minion.setParent(this);
        this.board.addUnit(minion);
    }

    public getCurrentPlayerEntities() {
        return this.board.getAllEntities().filter(unit => this.isPlayerTurn(unit.getOwner().getPlayerNumber()));
    }

    public getOtherPlayerNumber(playerNum: number): number {
        return (playerNum + 1) % this.players.length
    }

    public nextTurn() {
        this.turn = this.getOtherPlayerNumber(this.turn);
        this.turnNum++;
        let currentPlayerEntities = this.getCurrentPlayerEntities();
        currentPlayerEntities.forEach(unit => unit.refresh());
        this.addGameEvent(new GameEvent(GameEventType.turnStart, { player: this.turn, turnNum: this.turnNum }));
        this.attackers = [];
        this.blockers = [];
    }
}
