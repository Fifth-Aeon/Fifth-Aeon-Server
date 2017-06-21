import { Mechanic } from './mechanic';
import { Card } from './card';
import { sample } from 'lodash';

import { CardConstructor, allCards } from './cards/allCards';


class GameData {
    private cards: Map<string, CardConstructor> = allCards;

    public addCardConstructor(id: string, constructor: CardConstructor) {
        this.cards.set(id, constructor);
    }

    public getCard(id: string): Card {
        let constructor = this.cards.get(id);
        if (!constructor)
            throw Error('No card with id: ' + id);
        return new constructor();
    }

    public getRandomDeck(size: number): Card[] {
        let deck = [];
        let cards = Array.from(this.cards.values());
        for (let i = 0; i < size; i++) {
            let constr = sample(cards);
            if (!constr)
                throw new Error("No cards to construct");
            deck.push(new constr());
        }
        return deck;
    }
}

export const data = new GameData();