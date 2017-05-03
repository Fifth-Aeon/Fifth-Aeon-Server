import { Entity, Action } from './entity';
import { Queue } from 'typescript-collections';

/**
 * A simple board where each side can place up to a fixed number of units without any positoning.
 * 
 * @export
 * @class Board
 */
export class Board {
    private spaces: Entity[][];
   
    constructor(playerCount: number, spaceCount: number) {
        this.spaces = new Array(playerCount);
        for (let i = 0; i < this.spaces.length; i++) {
            this.spaces[i] = new Array(spaceCount);
        }
    }

    public addEntity(entity: Entity) {
        this.spaces[entity.getOwner()].push(entity);
    }

    public getAllEntities(): Array<Entity> {
        let res = [];
        for (let i = 0; i < this.spaces.length; i++) {
            for (let j = 0; j < this.spaces[i].length; j++) {
                if (this.spaces[i][j] !== null)
                    res.push(this.spaces[i][j]);
            }
        }
        return res;
    } 

    public removeEntity(entity:Entity) {
        for (let i = 0; i < this.spaces.length; i++) {
            for (let j = 0; j < this.spaces[i].length; j++) {
                if (this.spaces[i][j] === entity)
                    this.spaces[i].splice(j, 1);
            }
        }
    }
}
