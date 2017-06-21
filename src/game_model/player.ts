import { Card } from './card';
import { sample, remove } from 'lodash';
import { GameFormat } from './gameFormat';
import { Game } from './game';
import { Resource } from './resource';


export class Player {
    private format: GameFormat;
    private hand: Array<Card>;
    private deck: Array<Card>;
    private resource: Resource;
    private life: number;
    private hasPlayedResource: boolean;

    constructor(cards: Array<Card>, private playerNumber: number, initResource: Resource, life: number) {
        this.deck = cards;
        this.deck.forEach(card => card.setOwner(this));
        this.hand = [];
        this.life = life;
        this.resource = initResource; // Todo, fix by ref
    }

    public sumerize(): string {
        let hand = this.hand.map(card => card.toString()).join("\n");
        return `You have ${this.hand.length} cards in hand. \n${hand}`
    }

    public getPlayerNumber() {
        return this.playerNumber;
    }

    public canPlayResource(): boolean {
        return this.hasPlayedResource;
    }

    public playResource(played: Resource) {
        this.resource.addRes(played);
    }


    public getLife() {
        return this.life;
    }

    public takeDamage(damage: number) {
        this.life -= damage;
    }

    public startTurn() {
        this.resource
        this.drawCard();
    }

    public drawCards(quantity: number) {
        for (let i = 0; i < quantity; i++) {
            this.drawCard();
        }
    }

    public queryHand(query: string) {
        return this.queryCards(query, this.hand);
    }

    public queryCards(query: string, cards: Card[]): Card | null {
        let index = parseInt(query);
        if (!isNaN(index)) {
            if (cards[index])
                return cards[index];
        }
        return cards.find(card => {
            return card.getName().includes(query);
        }) || null;
    }

    public playCard(game: Game, card: Card) {
        remove(this.hand, (toRem:Card) => toRem === card);
        card.play(game);
    }

    public removeCard(card: Card) {
        remove(this.hand, (toRem:Card) => toRem === card);
    }

    public drawCard() {
        let drawn = sample(this.deck);
        remove(this.deck, drawn);
        if (!drawn)
            return;
        //drawn.owner = this;
        this.hand.push(drawn);
    }
}
