import { Card } from './card';
import { Unit } from './unit';
import { Resource } from './resource';
import { sample } from 'lodash';
import { store } from './store';


export interface CardGeneratorRecipe {
    rarityValues: number[];
    statsPerPoint: number;
}

function randInt(low: number, high: number): number {
    return Math.floor((high - low) * Math.random()) + low;
}

export class CardGenerator {
    private options: Array<{ cost: number, effect: (proto: any) => void }> = [];
    constructor() {
        this.options.push({ cost: 1, effect: (card) => card.life++ });
        this.options.push({ cost: 1, effect: (card) => card.damage++ });
    }

    public generateCards(recipe: CardGeneratorRecipe, count: number = 1): Array<Card> {
        let cards = [];
        for (let i = 0; i < count; i++) {
            cards.push(this.generateCard(recipe));
        }
        return cards;
    }

    private generateCard(recipe: CardGeneratorRecipe) {
        let cost = randInt(1, 10);
        let rarity = randInt(0, 3);
        let points = Math.ceil(cost * 2 * (1 + 0.25 * rarity));
        let proto = {
            cost: cost,
            rarity: rarity,
            life: 0,
            damage: 0
        }

        while (points > 0) {
            let next = sample(this.options) || { cost: 1, effect:() => null};
        points -= next.cost;
        next.effect(proto);
    }

        let card = new Unit(`Gen ${cost}-${rarity}`, new Resource(cost), [], proto.damage, proto.life);
return card;
    }
}