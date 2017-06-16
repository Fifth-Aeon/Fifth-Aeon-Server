import { Unit } from './unit';
import { GameEvent } from './game-event';

export class Modifier {
    name: string;
    description: string;

    dispellable: boolean;
    visible: boolean;

    damage: number;
    maxLife: number;
    attacksPerTurn: number;
    movesPerTurn: number;

    events: Array<GameEvent>;

    constructor(data:any) {
        this.name = data.name || '';
        this.description = data.description || '';
        this.dispellable = data.dispellable || true;
        this.visible = data.visible || true;
        this.damage = data.damage || 0;
        this.maxLife = data.maxLife || 0;
        this.attacksPerTurn = data.attacksPerTurn || 0;
        this.movesPerTurn = data.movesPerTurn || 0;

        this.events = [];
    }


    apply(target: Unit) {
        /*
        target.damage += this.damage;
        target.maxLife += this.maxLife;
        target.life += this.maxLife;
        target.movesPerTurn += this.movesPerTurn;
        target.attacksPerTurn += this.attacksPerTurn;
        target.events.addModifierEvents(this);
        */
    }

    remove(target: Unit) {
        /*
        target.damage -= this.damage;
        target.maxLife -= this.maxLife;
        target.life -= this.maxLife;
        target.movesPerTurn -= this.movesPerTurn;
        target.attacksPerTurn -= this.attacksPerTurn;
        target.events.removeModifierEvents(this);
        */
    }
}
