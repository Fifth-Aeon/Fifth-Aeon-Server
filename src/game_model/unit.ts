import { parse, stringify } from 'circular-json';


import { Game } from './game';
//import { Sprite } from './sprite';
import { Player } from './player';
import { Card } from './card';
import { EventGroup, EventType } from './gameEvent';
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


export abstract class Unit extends Card {
    // Board 
    private parent: Game;

    // Stats
    protected life: number;
    protected maxLife: number;
    protected damage: number;

    // Actions
    protected exausted: boolean;

    // Mods
    protected events: EventGroup;

    constructor() {
        super()
        this.events = new EventGroup();
        this.exausted = true;
        this.unit = true;
        this.life = this.life || this.maxLife;
    }

    public getEvents() {
        return this.events;
    }

    public getOwner(): Player {
        return this.owner;
    }

    public play(game: Game) {
        super.play(game);
        game.playUnit(this, 0);
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
        let eventParams = new Map<string, any>([
            ['damage', this.damage],
            ['attacker', this],
            ['defender', target]
        ]);
        let damage:number = this.events.trigger(EventType.onAttack, eventParams).get('damage');

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
        this.events.trigger(EventType.onDeath, new Map());
    }
}
