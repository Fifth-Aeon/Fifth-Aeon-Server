import { Dictionary } from 'typescript-collections';
import { Board } from './board';
import { Player, CardRecord } from './player';
import { Card } from './card';
import { Modifier } from './modifier';
import { Entity, Action } from './entity';



export class Game2P {
    id: string;
    board: Board;
    isPlayerTurn: boolean;
    player: Player;
    modifierLibrary: Dictionary<string, Modifier>;

    constructor() {
        this.board = new Board(5, 9);
        let card1 = new Card('testzor', 1, new Entity(1, 2));
        let card2 = new Card('testfir', 4, new Entity(4, 4));
        this.player = new Player([
            new CardRecord(card1, 1),
            new CardRecord(card2, 1)
        ]);
    }

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

    startGame() {
        this.isPlayerTurn = true;
        this.player.startTurn();
        this.getCurrentPlayerEntities().forEach(entity => entity.refresh());
    }

    playMinion(card: Card, pc: boolean, row: number, col: number) {
        let minion = card.minion.newInstance(card);
        card.minionModifiers.forEach(modRecord => {
            let modifier = this.modifierLibrary.getValue(modRecord.id);
            minion.addModifier(modifier);
        })
        this.addEntity(minion, pc, row, col);
    }

    addEntity(minion: Entity, pc: boolean, row: number, col: number) {
        minion.row = row;
        minion.col = col;
        minion.playerControlled = pc;
        minion.parent = this;
        this.board.cells[row][col] = minion;
    }

    getCurrentPlayerEntities() {
        return this.board.getAllEntities().filter(entity => entity.playerControlled == this.isPlayerTurn);
    }

    nextTurn() {
        this.isPlayerTurn = !this.isPlayerTurn;
        let currentPlayerEntities = this.getCurrentPlayerEntities();
        currentPlayerEntities.forEach(entity => entity.refresh());
        if (!this.isPlayerTurn) {
        } else {
            this.player.startTurn();
        }
    }
}
