import { Game } from './game';
import { Unit } from './unit';

export abstract class Targeter<T> {
    abstract getTarget(game: Game): T;
    abstract getText(): string;
}

export class SingleUnit extends Targeter<Unit> {
    public getTarget(game: Game) {
        return game.getCurrentPlayerEntities()[0];
    }
    public getText () {
        return 'target unit';
    }
}