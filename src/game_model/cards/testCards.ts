import { Mechanic } from '../mechanic';
import { Card } from '../card';
import { Unit } from '../unit';
import { SingleUnit } from '../targeter';
import { DealDamage } from './mechanics/dealDamage';
import { Resource } from '../resource';
import { data } from '../gameData';

export class DamageCard extends Card {
    protected name = "Damage";
    protected cost = new Resource(1);
    protected targeter = new SingleUnit();

    constructor() {
        super()
        this.mechanics = [new DealDamage(1, this.targeter)]
    }
}

export class BasicUnit extends Unit {
    protected name: 'basic';
    protected cost = new Resource(1)

    protected maxLife = 2;
    protected damage = 2;
}

data.addCardConstructor('DamageCard', DamageCard);