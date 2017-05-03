import { Entity, Action, ActionType } from './entity';
import { Game2P } from './game2p';
import { Player } from './player';
import { remove } from 'lodash';

export class Card {
    cost: number;
    minion: Entity;
    owner: Player;
    name: string;
    dataId: string;
    minionModifiers: Array<{ id: string, param: number }>;

    constructor(name: string = 'nameless', cost: number = 1, minion: Entity, minionModifiers = []) {
        this.cost = cost;
        this.minion = minion;
        this.name = name;
        this.minionModifiers = minionModifiers;
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

        this.minion = new Entity(1, 1);
        if (data.minion)
            this.minion.unpackData(data.minion);
        this.minion.cardDataId = this.dataId;
    }

    public newInstance(): Card {
        let clone =  new Card(this.name, this.cost, this.minion, this.minionModifiers);
        clone.unpackData(this);
        return clone;
    }

    public play(battle: Game2P, row: number, col: number) {
        this.owner.mana -= this.cost;
        battle.playMinion(this, true, row, col);
        remove(this.owner.hand, (card) => card === this);
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
