import { Card } from './card';
import { sample, remove } from 'lodash';
import { GameFormat } from './gameFormat';
import { Game2P } from './game2p';
import {Resource} from './resource';


export class Player {
    private format: GameFormat;
    private hand: Array<Card>;
    private deck: Array<Card>;
    private resource: Resource;
    private life: number;
    private hasPlayedResource: boolean;

    constructor(cards: Array<Card>, initResource:Resource, life: number) {
        this.deck = cards;
        this.hand = [];
        this.life = life;
        this.resource = initResource; // Todo, fix by ref
    }

    public sumerize(): string {
        let hand = this.hand.map(card => card.toString()).join("\n");
        return `You have ${this.hand.length} cards in hand. \n${hand}`
    }

    public canPlayResource(): boolean {
        return this.hasPlayedResource;
    }

    public playResource (played:Resource) {
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
        console.log('draw', quantity);
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
        let drawn = sample(this.deck);
        remove(this.deck, drawn);
        //drawn.owner = this;
        this.hand.push(drawn);
    }
}
