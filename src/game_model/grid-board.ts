import { Unit, Action } from './unit';
import { Queue } from 'typescript-collections';

/*
export class BoardCoordinate {
    constructor(public row: number, public col: number) { }
}


export const init2dArray = (rows: number, cols: number) => {
    let array = [];
    for (let row = 0; row < rows; row++) {
        array.push(new Array(cols));
    }
    return array;
}

export class Board {
    cells: Array<Array<Unit>>;
    rows: number;
    cols: number;
    dataId: string;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.cells = [];
        for (let i = 0; i < rows; i++) {
            this.cells.push([]);
            for (let j = 0; j < cols; j++) {
                this.cells[i].push(null);
            }
        }
    }

    getAllEntities(): Array<Unit> {
        let res = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.cells[i][j] !== null)
                    res.push(this.cells[i][j]);
            }
        }
        return res;
    }

    moveCharacter(startRow: number, startCol: number, endRow: number, endCol: number) {
        let unit = this.cells[startRow][startCol];
        if (!unit)
            return;
        this.cells[endRow][endCol] = unit;
        this.cells[startRow][startCol] = null
    }

    inBounds(row: number, col: number): boolean {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    getNeighbors(row: number, col: number, diagonalsAllowed: boolean): Array<BoardCoordinate> {
        let neighbors = [];
        for (let dr = -1; dr < 2; dr++) {
            for (let dc = -1; dc < 2; dc++) {
                let nr = row + dr,
                    nc = col + dc,
                    change = Math.abs(dr) + Math.abs(dc);
                if (change > 0 &&
                    (diagonalsAllowed || change < 2) &&
                    this.inBounds(nr, nc)
                ) {
                    neighbors.push(new BoardCoordinate(nr, nc));
                }
            }
        }
        return neighbors;
    }

    isPathable(player: boolean, cord: BoardCoordinate) {
        let unit = this.cells[cord.row][cord.col];
        if (!unit)
            return true;
        return unit.playerControlled == player;
    }

    breadthFirstSearch(player: boolean, row: number, col: number): SearchResult {
        let result = new SearchResult(this.rows, this.cols);
        let source = new BoardCoordinate(row, col);
        result.distance[row][col] = 0;
        result.parent[row][col] = null;
        let queue = new Queue<BoardCoordinate>();
        queue.enqueue(source);
        while (!queue.isEmpty()) {
            let current = queue.dequeue();
            this.getNeighbors(current.row, current.col, false).forEach(neighbor => {
                if (result.getDistance(neighbor) === Infinity && this.isPathable(player, neighbor)) {
                    result.distance[neighbor.row][neighbor.col] = result.getDistance(current) + 1;
                    result.parent[neighbor.row][neighbor.col] = current;
                    queue.enqueue(neighbor);
                }
            });
        }
        return result;
    }
}


class SearchResult {
    distance: Array<Array<number>>;
    parent: Array<Array<BoardCoordinate>>;
    rows: number;
    cols: number;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.distance = [];
        this.parent = []
        for (let i = 0; i < rows; i++) {
            this.distance[i] = [];
            this.parent[i] = [];
            for (let j = 0; j < cols; j++) {
                this.distance[i][j] = Infinity;
                this.parent[i][j] = null;
            }
        }
    }
    getAllCoords() {
        let res = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                res.push(new BoardCoordinate(i, j));
            }
        }
        return res;
    }
    getPath(row: number, col: number): Array<BoardCoordinate> {
        let path = [];
        let current = new BoardCoordinate(row, col);
        while (this.getParent(current) != null) {
            path.push(current);
            current = this.getParent(current);
        }
        return path;
    }
    getDistance(coord: BoardCoordinate) {
        return this.distance[coord.row][coord.col];
    }
    getParent(coord: BoardCoordinate) {
        return this.parent[coord.row][coord.col];
    }
    getReachable(moveSpeed: number): Array<BoardCoordinate> {
        return this.getAllCoords().filter(coord => {
            let dist = this.getDistance(coord);
            return dist > 0 && dist <= moveSpeed;
        });
    }
}
*/ 