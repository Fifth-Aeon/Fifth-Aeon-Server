import { parse, stringify } from 'circular-json';

import { Unit, Action, ActionType } from './unit';
import { Resource } from './resource';
import { Game } from './game';
import { Player } from './player';
import { Mechanic } from './mechanics';
import { remove } from 'lodash';
import { Storable } from './store';
import { Collections, Type, Types } from './dataTypes'


export class Card implements Storable {
    protected name: string;
    protected id: string;
    protected set: string;
    protected rarity: number;
    protected mechanics: any[];

    protected cost: Resource;
    protected unit = false;
    protected owner: Player;

    protected dataId: string;
    protected minionModifiers: Array<{ id: string, param: number }>;

    protected metadata = {
        types: new Map<string, Type>(),
        values: new Map<string, string>()
    }

    constructor(name: string = 'nameless', cost: Resource = new Resource(), minionModifiers:any[] = []) {
        this.cost = cost;
        this.name = name;
        this.id = Math.random().toString()
        this.minionModifiers = minionModifiers;
    }

    public setOwner(owner: Player) {
        this.owner = owner;
    }

    public getName() {
        return this.name;
    }

    public getMetadata() {
        this.metadata.types.set('mechanics', new Type(Types.list, Collections.mechanic));
        return this.metadata;
    }

    public isEntiy(): boolean {
        return this.unit;
    }

    public toString(): string {
        return `${this.name}: (${this.cost})`
    }

    public toJson() {
        let json = stringify(this);
        return json;
    }

    public fromJson(raw: object) {
        return null;
    }

    public unpackData(data:any) {
        this.dataId = data.dataId || this.dataId;
        this.name = data.name || this.name;
        this.cost = data.cost || this.cost;
        this.minionModifiers = data.minionModifiers || [];
    }

    public newInstance(): Card {
        let clone = new Card(this.name, this.cost, this.minionModifiers);
        clone.unpackData(this);
        return clone;
    }

    public play(game: Game) {
        //this.owner.mana -= this.cost;
    }

    public getActions(battle: Game) {
        let entities = battle.getCurrentPlayerEntities();
        let targets = [];
        return [];
        /*
        entities.forEach(unit => {
            battle.board.getNeighbors(unit.row, unit.col, true).forEach(neighbor => {
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
