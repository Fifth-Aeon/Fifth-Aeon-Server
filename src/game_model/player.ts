import { Card } from './card';
import { sample } from 'lodash';

export class CardRecord {
    constructor(public card: Card, public quantity: number) { }

    toSavable() {
        return {
            card: this.card.toSavable(),
            quantity: this.quantity
        }
    }
}

const maxCards = 6;
const initialCards = 4;
const finalMana = 9;

export class Player {
    token: string;
    name: string;
    
    hand: Array<Card>;
    deck: Array<Card>;
    deckPrototype: Array<CardRecord>;
    mana: number;
    maxMana: number;

    constructor(cards: Array<CardRecord>) {
        this.deckPrototype = cards;
        this.deck = this.deckFromProtoype(this.deckPrototype);
        this.hand = [];

        this.maxMana = 0;
        this.mana = 0;
    }

    deckFromProtoype(cards: Array<CardRecord>): Array<Card> {
        let deck = Array<Card>();
        cards.forEach(record => {
            for (let i = 0; i < record.quantity; i++) {
                deck.push(record.card);
            }
        });
        return deck;
    }

    toSavable() {
        return {
            hand: this.hand.map(card => card.toSavable()),
            deck: this.deck.map(card => card.toSavable()),
            mana: this.mana,
            maxMana: this.maxMana
        }
    }

    fromSavable() {

    }

    startTurn() {
        if (this.maxMana < finalMana)
            this.maxMana++;
        this.mana = this.maxMana;
        this.drawCard();
    }

    drawCards(quantity: number) {
        for (let i = 0; i < quantity; i++) {
            this.drawCard();
        }
    }

    drawCard() {
        if (this.hand.length >= maxCards)
            return;
        let drawn = sample(this.deck).newInstance();
        //drawn.owner = this;
        this.hand.push(drawn);
    }
}
