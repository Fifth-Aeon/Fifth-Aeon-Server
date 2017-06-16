import { Mechanic } from '../mechanic';
import { Card } from '../card';
import { Unit } from '../unit';
import { SingleUnit } from '../targeter';
import { DealDamage } from './mechanics/dealDamage';

import { data } from '../gameData';

export class DamageCard extends Card {
    protected name = "Damage";

    constructor() {
        super()
        this.mechanics = [new DealDamage(1, new SingleUnit())]
    }
}

export class BasicUnit extends Unit {
    protected name: 'basic';
    protected life = 2;
    protected damage = 2;
}

data.addCardConstructor('DamageCard', DamageCard);