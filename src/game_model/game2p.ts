import { Dictionary } from 'typescript-collections';
import { Board } from './basic-board';
import { Player, CardRecord } from './player';
import { Card } from './card';
import { Modifier } from './modifier';
import { Entity, Action } from './entity';
import { GameFormat } from './gameFormat';

export class Game2P {
    public id: string;
    private board: Board;
    private turn: number;
    private turnNum: number;
    private players: Player[];
    private modifierLibrary: Dictionary<string, Modifier>;
    private format:GameFormat;

    constructor() {
        this.format = new GameFormat();
        this.board = new Board(2, 12);
        this.turnNum = 1;
        let card1 = new Entity('test1');
        let card2 = new Entity('test2');
        this.players = [new Player([
            new CardRecord(card1, 1),
            new CardRecord(card2, 1)
        ]), new Player([
            new CardRecord(card1, 1),
            new CardRecord(card2, 1)
        ])];
    }

    public removeEntity(entity: Entity) {
        this.board.removeEntity(entity);
    }

    /*
        buildBoard(boardData, cards: Dictionary<string, Card>, modifiers: Dictionary<string, Modifier>) {
    
            this.player = new Player(cards.values().map(card => new CardRecord(card, 1)));
    
    
            this.modifierLibrary = modifiers;
            this.board = new Board(boardData.rows || 5, boardData.cols || 9);
    
    
            for (let i = 0; i < this.board.rows; i++) {
                for (let j = 0; j < this.board.cols; j++) {
    
                    if (!(boardData.board[i] && boardData.board[i][j]))
                        continue;
                    let data = boardData.board[i][j];
                    let card = cards.getValue(data.cardDataId);
    
                    this.playMinion(card, data.isPlayerControlled, i, j);
                }
            }
        }
        */

    public getPlayerSummary(playerNum: number):string {
        let hand = this.players[playerNum].hand.map(card => card.toString()).join("\n");
        let playerBoard = this.board.getPlayerEntities(playerNum).map(entity => entity.toString()).join("\n");
        let enemyBoard = this.board.getPlayerEntities(this.getOtherPlayerNumber(playerNum)).map(entity => entity.toString()).join("\n");

        return `Turn ${this.turnNum}
        
        You have ${this.players[playerNum].hand.length} cards in hand.
        ${hand}

        Your Board
        ${playerBoard}

        Enemy Board
        ${playerBoard}`
    }

    public startGame() {
        this.turn = 0;
        this.players[this.turn].startTurn();
        this.getCurrentPlayerEntities().forEach(entity => entity.refresh());
    }

    public playEntity(ent:Entity, owner: number) {
        this.addEntity(ent, owner);
    }

    public addEntity(minion: Entity, owner: number) {
        minion.setParent(this);
        this.board.addEntity(minion);
    }

    public getCurrentPlayerEntities() {
        return this.board.getAllEntities().filter(entity => entity.getOwner() == this.turn);
    }

    public getOtherPlayerNumber(playerNum:number):number {
        return (playerNum + 1) % this.players.length

    }

    public nextTurn() {
        this.turn = this.getOtherPlayerNumber(this.turn);
        let currentPlayerEntities = this.getCurrentPlayerEntities();
        currentPlayerEntities.forEach(entity => entity.refresh());
    }
}
