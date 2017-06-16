import { Mechanic } from '../../mechanic';
import { Game } from '../../Game';
import { Targeter } from '../../targeter';
import { Card } from '../../card';
import { Unit } from '../../unit';

export class DealDamage extends Mechanic {
    constructor(private amount: number, private targeter: Targeter<Unit>) {
        super();
    }

    public run(card: Card, game: Game) {
        this.targeter.getTarget(game).takeDamage(this.amount);
    }

    public getText(card: Card) {
        return `Deal ${this.amount} damage to ${this.targeter.getText()}.`
    }
}
