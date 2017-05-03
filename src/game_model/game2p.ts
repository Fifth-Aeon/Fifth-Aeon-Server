import { Dictionary } from 'typescript-collections';
import { Board } from './basic-board';
import { Player, CardRecord } from './player';
import { Card } from './card';
import { Modifier } from './modifier';
import { Entity, Action } from './entity';



export class Game2P {
    public id: string;
    private board: Board;
    private turn: number;
    private players: Player[];
    private modifierLibrary: Dictionary<string, Modifier>;

    constructor() {
        this.board = new Board(2, 12);
        let card1 = new Card('testzor', 1, new Entity(1, 2));
        let card2 = new Card('testfir', 4, new Entity(4, 4));
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

    public startGame() {
        this.turn = 0;
        this.players[this.turn].startTurn();
        this.getCurrentPlayerEntities().forEach(entity => entity.refresh());
    }

    public playMinion(card: Card, pc: boolean, row: number, col: number) {
        let minion = card.minion.newInstance(card);
        card.minionModifiers.forEach(modRecord => {
            let modifier = this.modifierLibrary.getValue(modRecord.id);
            minion.addModifier(modifier);
        })
        this.addEntity(minion, pc, row, col);
    }

    public addEntity(minion: Entity, pc: boolean, row: number, col: number) {
        minion.setParent(this);
        this.board.addEntity(minion);
    }

    public getCurrentPlayerEntities() {
        return this.board.getAllEntities().filter(entity => entity.getOwner() == this.turn);
    }

    public nextTurn() {
        this.turn = (this.turn + 1) % this.players.length;
        let currentPlayerEntities = this.getCurrentPlayerEntities();
        currentPlayerEntities.forEach(entity => entity.refresh());
    }
}
