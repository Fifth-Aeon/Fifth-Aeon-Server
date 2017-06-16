import { Mechanic } from './mechanic';
import { Card} from './card';


class GameData {
    private cards:Map<string, Card> = new Map<string, Card>();
    public addCard(id:string, card:Card) {
        this.cards.set(id, card);
    }
    public getCard(id: string) {
        let card = this.cards.get(id);
        if (!card)
            throw Error('No card with id: ' + id);
        return card;
    }
}

export const data = new GameData();