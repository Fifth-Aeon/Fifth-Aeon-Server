import { Dictionary } from 'typescript-collections'

import { Battle } from './battle';
import { Sprite } from './sprite';
import { Card } from './card';
import { Modifier } from './modifier';
import { EventGroup, EventType } from './game-event';

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

export class Entity {
    // Board 
    cardDataId: string;
    parent: Battle;
    playerControlled: boolean;
    row: number;
    col: number;
    sprite: Sprite;
    id: number;

    // Stats
    life: number;
    maxLife: number;
    damage: number;

    // Actions
    movesPerTurn: number;
    moves: number;
    moveSpeed: number;
    attacksPerTurn: number;
    attacks: number;

    // Mods
    modifiers: Modifier[];
    events: EventGroup;

    constructor(damage: number, life: number) {
        this.id = Math.random();
        this.events = new EventGroup();
        this.modifiers = [];

        this.sprite = new Sprite();
        this.movesPerTurn = 1;
        this.attacksPerTurn = 1;
        this.moves = 0;
        this.attacks = 0;
        this.moveSpeed = 2;

        this.life = life;
        this.damage = damage;
        this.maxLife = life;
    }

    unpackData(data) {
        this.damage = data.damage;
        this.maxLife = data.maxLife;
        this.life = this.maxLife;

        this.sprite = new Sprite();
        this.sprite.row = data.sprite.row;
        this.sprite.col = data.sprite.col;
    }

    addModifier(mod:Modifier) {
        this.modifiers.push(mod);
        console.log('apply', mod, 'to', this);
        mod.apply(this);
        console.log('result', this);
    }

    newInstance(cardForm: Card): Entity {
        let clone = new Entity(this.damage, this.life);
        clone.cardDataId = cardForm.dataId;
        let props = [
            'parent', 'sprite', 'playerControlled', 'row', 'col',
            'life', 'maxLife', 'damage',
            'movesPerTurn', 'moves', 'moveSpeed', 'attacksPerTurn', 'attacks'];
        props.forEach(prop => {
            clone[prop] = this[prop];
        });
        clone.id = Math.random();
        return clone;
    }
    refresh() {
        this.moves = this.movesPerTurn;
        this.attacks = this.attacksPerTurn;
    }

    canMove() {
        return this.moves > 0;
    }

    canAttack() {
        return this.attacks > 0;
    }

    getPossibleAcitons(): Array<Action> {
        let actions = [];
        if (this.canMove()) {
            let search = this.parent.board.breadthFirstSearch(this.playerControlled, this.row, this.col);
            let moves = search.getReachable(this.moveSpeed).filter(
                coord => this.parent.board.cells[coord.row][coord.col] === null
            ).map(
                coord => new Action(ActionType.move, this, coord.row, coord.col, executeMove)
                );
            actions = actions.concat(moves);
        }
        if (this.canAttack()) {
            let neighbors = this.parent.board.getNeighbors(this.row, this.col, true);
            let attacks = neighbors.filter(coord => {
                let entity = this.parent.board.cells[coord.row][coord.col];
                return entity !== null && entity.playerControlled !== this.playerControlled;
            }).map(
                coord => new Action(ActionType.attack, this, coord.row, coord.col, executeAttack)
                );
            actions = actions.concat(attacks);
        }
        return actions;
    }

    toString() {
        return `<Entity ${this.id} (${this.row}, ${this.col}) [${this.damage}/${this.life}]>`;
    }

    move(row: number, col: number) {
        let board = this.parent.board;
        board.moveCharacter(this.row, this.col, row, col);
        this.moves--;
        this.row = row;
        this.col = col;
    }

    attack(row: number, col: number) {
        let board = this.parent.board;
        let target = board.cells[row][col];
        if (target === null)
            console.error('Errror, attacking null target from', this.toString());

        // Trigger an attack event
        let damage = this.events.trigger(EventType.onAttack, this.events.makeParams({
            damage: this.damage,
            attacker: this,
            defender: target
        })).getValue('damage');

        // Remove actions and deal damage
        this.attacks--;
        this.moves--;
        this.dealDamage(target, damage);
        target.dealDamage(this, target.damage);
    }

    takeDamage(amount: number) {
        this.life -= amount;
        if (this.life <= 0) {
            this.die();
        }
    }

    dealDamage(target: Entity, amount: number) {
        target.takeDamage(amount);
    }

    die() {
        this.parent.board.cells[this.row][this.col] = null;
    }
}
