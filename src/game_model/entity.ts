import { Dictionary } from 'typescript-collections'

import { Game2P } from './game2p';
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
        public actor: Entity,
        public row: number,
        public col: number,
        public executeAction: () => void
    ) { }
}

export class Event { }

function executeMove() {
    this.actor.move(this.row, this.col);
}

function executeAttack() {
    this.actor.attack(this.row, this.col);
}

export class Entity extends Card {
    // Board 
    private cardDataId: string;
    private parent: Game2P;

    // Stats
    private life: number;
    private maxLife: number;
    private damage: number;

    // Actions
    private exausted: boolean;

    // Mods
    private modifiers: Modifier[];
    private events: EventGroup;

    constructor(name: string = 'nameles', cost: Resource = new Resource(), minionModifiers = [], damage: number = 1, life: number = 1) {
        super(name, cost)
        this.events = new EventGroup();
        this.exausted = true;
        this.life = life;
        this.damage = damage;
        this.maxLife = life;
        this.entity = true;
    }

    public setParent(parent: Game2P) {
        this.parent = parent;
    }

    public getOwner(): Player {
        return this.owner;
    }

    public play(game: Game2P) {
        super.play(game);
        game.playEntity(this, 0);
    }

    public addModifier(mod: Modifier) {
        this.modifiers.push(mod);
        console.log('apply', mod, 'to', this);
        mod.apply(this);
        console.log('result', this);
    }

    public newInstance(): Card {
        let clone = new Entity(this.name, this.cost, this.minionModifiers, this.damage, this.life);
        //clone.cardDataId = cardForm.dataId;
        let props = [
            'parent', 'sprite', 'playerControlled', 'row', 'col',
            'life', 'maxLife', 'damage',
            'movesPerTurn', 'moves', 'moveSpeed', 'attacksPerTurn', 'attacks'];
        props.forEach(prop => {
            clone[prop] = this[prop];
        });
        clone.id = Math.random().toString();
        return clone;
    }

    public refresh() {
        this.exausted = false;
        this.life = this.maxLife;
    }


    public canActivate(): boolean {
        return this.exausted;
    }

    public getPossibleAcitons(): Array<Action> {
        let actions = [];

        if (this.canActivate()) {

        }
        return actions;
    }

    public toString() {
        return `${this.name} (${this.cost}) - (${this.damage}/${this.life})`;
    }

    public toJson() {
        let owner = this.owner;
        let parent = this.parent
        this.owner = null;
        this.parent = null;
        let json = JSON.stringify(this);
        this.owner = owner;
        this.parent = this.parent;
        return json;
    }

    public fight(target: Entity) {
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

    public dealDamage(target: Entity, amount: number) {
        target.takeDamage(amount);
    }

    public die() {
        this.parent.removeEntity(this);
    }
}
