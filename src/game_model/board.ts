import { Unit, Action } from './unit';
import { Queue } from 'typescript-collections';

/**
 * A simple board where each side can place up to a fixed number of units without any positoning.
 * 
 * @export
 * @class Board
 */
export class Board {
    private spaces: Unit[][];
   
    constructor(playerCount: number, spaceCount: number) {
        this.spaces = new Array(playerCount);
        for (let i = 0; i < this.spaces.length; i++) {
            this.spaces[i] = [];
        }
    } 

    public addUnit(unit: Unit) {
        this.spaces[unit.getOwner().getPlayerNumber()].push(unit);
    }

    public getAllEntities(): Array<Unit> {
        let res = [];
        for (let i = 0; i < this.spaces.length; i++) {
            for (let j = 0; j < this.spaces[i].length; j++) {
                res.push(this.spaces[i][j]);
            }
        }
        return res;
    } 

    public getPlayerEntities(playerNumber: number) {
        return this.spaces[playerNumber];
    }

    public removeUnit(unit:Unit) {
        for (let i = 0; i < this.spaces.length; i++) {
            for (let j = 0; j < this.spaces[i].length; j++) {
                if (this.spaces[i][j] === unit)
                    this.spaces[i].splice(j, 1);
            }
        }
    }
}
