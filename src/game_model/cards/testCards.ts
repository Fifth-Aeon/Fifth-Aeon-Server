import { Mechanic } from '../mechanic';
import { Card } from '../card';
import { Unit } from '../unit';
import { SingleUnit } from '../targeter';

import { DealDamage } from './mechanics/dealDamage';

export class DamageCard extends Card {
    protected name = "Damage";

    constructor() {
        super()
        this.mechanics = [new DealDamage(1, new SingleUnit())]
    }
}