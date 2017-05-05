import { Entity, Action, ActionType } from './entity';
import { Resource } from './resource';
import { Game2P } from './game2p';
import { Player } from './player';
import { remove } from 'lodash';

export class Card {
    protected cost: Resource;
    protected minion: Entity;
    protected entity = false;
    protected owner: number;
    protected owningPlayer: Player;
    protected name: string;
    protected id: string;
    protected dataId: string; 
    protected minionModifiers: Array<{ id: string, param: number }>;

    constructor(name: string = 'nameless', cost: Resource = new Resource(), minionModifiers = []) {
        this.cost = cost;
        this.name = name;
        this.id = Math.random().toString()
        this.minionModifiers = minionModifiers;
    }

    public isEntiy(): boolean {
        return this.entity;
    }

    public toString():string {
        return `${this.name}: (${this.cost}) - [${this.minion.toString()}]`
    }

    public toSavable() {
        return {
            id: this.dataId || 'villager'
        }
    }

    public unpackData(data) {
        this.dataId = data.dataId || this.dataId;
        this.name = data.name || this.name;
        this.cost = data.cost || this.cost;
        this.minionModifiers = data.minionModifiers || [];
        this.minion.cardDataId = this.dataId;
    }

    public newInstance(): Card {
        let clone =  new Card(this.name, this.cost, this.minionModifiers);
        clone.unpackData(this);
        return clone;
    }

    public play(battle: Game2P) {
        //this.owner.mana -= this.cost;
        remove(this.owningPlayer.hand, (card) => card === this);
    }

    public getActions(battle: Game2P) {
        let entities = battle.getCurrentPlayerEntities();
        let targets = [];
        return [];
        /*
        entities.forEach(entity => {
            battle.board.getNeighbors(entity.row, entity.col, true).forEach(neighbor => {
                targets.push(neighbor);
            });
        })
        return targets.map(target => {
            return new Action(ActionType.spell, null, target.row, target.col, () => {
                this.play(battle, target.row, target.col);
            })
        }).filter(action => {
            return battle.board.cells[action.row][action.col] === null;
        });
        */
    }
}
