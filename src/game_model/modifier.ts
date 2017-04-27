import { Entity } from './entity';
import { GameEvent } from './game-event';
import { Trigger } from './trigger/trigger';

export class Modifier {
    name: string;
    description: string;

    dispellable: boolean;
    visible: boolean;

    damage: number;
    maxLife: number;
    attacksPerTurn: number;
    movesPerTurn: number;

    triggers: Array<Trigger>;
    events: Array<GameEvent>;

    constructor(data) {
        this.name = data.name || '';
        this.description = data.description || '';
        this.dispellable = data.dispellable || true;
        this.visible = data.visible || true;
        this.damage = data.damage || 0;
        this.maxLife = data.maxLife || 0;
        this.attacksPerTurn = data.attacksPerTurn || 0;
        this.movesPerTurn = data.movesPerTurn || 0;

        this.events = [];
        this.triggers = [new Trigger()];
    }


    apply(target: Entity) {
        target.damage += this.damage;
        target.maxLife += this.maxLife;
        target.life += this.maxLife;
        target.movesPerTurn += this.movesPerTurn;
        target.attacksPerTurn += this.attacksPerTurn;
        target.events.addModifierEvents(this);
    }

    remove(target: Entity) {
        target.damage -= this.damage;
        target.maxLife -= this.maxLife;
        target.life -= this.maxLife;
        target.movesPerTurn -= this.movesPerTurn;
        target.attacksPerTurn -= this.attacksPerTurn;
        target.events.removeModifierEvents(this);
    }
}
