import { serialize, serializeAs } from 'cerialize';

import { Resource } from './resource';
import { Game } from './game';
import { Player } from './player';
import { Mechanic } from './mechanic';
import { Targeter } from './targeter';
import { remove } from 'lodash';


export abstract class Card {
    @serialize protected name: string;
    @serialize protected id: string;
    @serialize protected set: string;
    @serialize protected rarity: number;
    @serializeAs(Mechanic) protected mechanics: Mechanic[] = [];

    @serializeAs(Resource) protected cost: Resource;
    @serialize protected unit = false;
    @serialize protected owner: Player;
    @serialize protected dataId: string;

    protected targeter: Targeter<any>;

    constructor() {
        this.id = Math.random().toString(16)
    }

    public play(game: Game) {
        //this.owner.mana -= this.cost;
    }

    public getText():string {
        return this.mechanics.map(mechanic => mechanic.getText(this)).join(' ');
    }

    public getTargeter() {
        return this.targeter;
    }

    public setOwner(owner: Player) {
        this.owner = owner;
    }

    public getName() {
        return this.name;
    }

    public isUnit(): boolean {
        return this.unit;
    }

    public toString(): string {
        return `${this.name}: (${this.cost})`
    }



    public getActions(battle: Game) {
        let entities = battle.getCurrentPlayerEntities();
        let targets = [];
        return [];
    }
}
