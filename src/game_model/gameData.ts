import { Mechanic } from './mechanic';
import { Card } from './card';

interface CardConstructor {
    new (): Card;
}

class GameData {
    private cards: Map<string, CardConstructor> = new Map<string, CardConstructor>();

    public addCardConstructor(id: string, constructor: CardConstructor) {
        this.cards.set(id, constructor);
    }

    public getCard(id: string): Card {
        let constructor = this.cards.get(id);
        if (!constructor)
            throw Error('No card with id: ' + id);
        return new constructor();
    }
}

export const data = new GameData();