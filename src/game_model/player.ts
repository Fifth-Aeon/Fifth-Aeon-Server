import { Card } from './card';
import { sample, remove } from 'lodash';
import { GameFormat } from './gameFormat';
import { Game2P } from './game2p';


const maxCards = 6;
const initialCards = 4;
const finalMana = 9;

export class Player {
    private format: GameFormat;
    private hand: Array<Card>;
    private deck: Array<Card>;
    private mana: number;
    private maxMana: number;
    private life: number;

    public sumerize(): string {
        let hand = this.hand.map(card => card.toString()).join("\n");


        return `You have ${this.hand.length} cards in hand.
            ${hand}`

    }

    constructor(cards: Array<Card>) {
        this.hand = [];
        this.maxMana = 0;
        this.mana = 0;
    }

    public takeDamage(damage: number) {
        this.life -= damage;
    }

    public startTurn() {
        if (this.maxMana < finalMana)
            this.maxMana++;
        this.mana = this.maxMana;
        this.drawCard();
    }

    public drawCards(quantity: number) {
        for (let i = 0; i < quantity; i++) {
            this.drawCard();
        }
    }

    public playCard(game: Game2P, card: Card) {
        remove(this.hand, (toRem) => toRem === card);
        card.play(game);
    }

    public removeCard(card: Card) {
        remove(this.hand, (toRem) => toRem === card);
    }

    public drawCard() {
        if (this.hand.length >= maxCards)
            return;
        let drawn = sample(this.deck).newInstance();
        //drawn.owner = this;
        this.hand.push(drawn);
    }
}
