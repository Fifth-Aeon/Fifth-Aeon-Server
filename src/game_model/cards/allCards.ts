import { Card } from '../card';
import { DamageCard, BasicUnit } from './testCards';

export interface CardConstructor {
    new (): Card;
}

export const allCards = new Map<string, CardConstructor>();

allCards.set('DamageCard', DamageCard);
allCards.set('BasicUnit', BasicUnit);