import { parse, stringify } from 'circular-json';


import { Game } from './game';
//import { Sprite } from './sprite';
import { Player } from './player';
import { Card } from './card';
import { Modifier } from './modifier';
import { EventGroup, EventType } from './game-event';
import { Resource } from './resource';

export enum ActionType {
    move, attack, spell
}

export class Action {
    constructor(
        public type: ActionType,
        public actor: Unit,
        public row: number,
        public col: number,
        public executeAction: () => void
    ) { }
}

export class Event { }



export class Unit extends Card {
    // Board 
    private cardDataId: string;
    private parent: Game;

    // Stats
    private life: number;
    private maxLife: number;
    private damage: number;

    // Actions
    private exausted: boolean;

    // Mods
    private modifiers: Modifier[];
    private events: EventGroup;

    constructor(name: string = 'nameles', cost: Resource = new Resource(), minionModifiers: Modifier[] = [], damage: number = 1, life: number = 1) {
        super(name, cost)
        this.events = new EventGroup();
        this.exausted = true;
        this.life = life;
        this.damage = damage;
        this.maxLife = life;
        this.unit = true;
        this.modifiers = minionModifiers;
    }

    public setParent(parent: Game) {
        this.parent = parent;
    }

    public getOwner(): Player {
        return this.owner;
    }

    public play(game: Game) {
        super.play(game);
        game.playUnit(this, 0);
    }

    public addModifier(mod: Modifier) {
        this.modifiers.push(mod);
        mod.apply(this);
    }
 

    public refresh() {
        this.exausted = false;
        this.life = this.maxLife;
    }


    public canActivate(): boolean {
        return this.exausted;
    }

    public getPossibleAcitons(): Array<Action> {
        let actions: Action[] = [];

        if (this.canActivate()) {

        }
        return actions;
    }

    public toString() {
        return `${this.name} (${this.cost}) - (${this.damage}/${this.life})`;
    }

    public toJson() {

        return stringify(this);
    }

    public fight(target: Unit) {
        // Trigger an attack event
        let damage = this.events.trigger(EventType.onAttack, this.events.makeParams({
            damage: this.damage,
            attacker: this,
            defender: target
        })).getValue('damage');

        // Remove actions and deal damage
        this.dealDamage(target, damage);
        target.dealDamage(this, target.damage);
    }

    public takeDamage(amount: number) {
        this.life -= amount;
        if (this.life <= 0) {
            this.die();
        }
    }

    public dealDamage(target: Unit, amount: number) {
        target.takeDamage(amount);
    }

    public die() {
        this.parent.removeUnit(this);
    }
}
