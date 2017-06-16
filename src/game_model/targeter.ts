import { Game } from './game';
import { Unit } from './unit';

export abstract class Targeter<T> {
    protected target:T;
    public needsInput():boolean {
        return true;
    }
    public setTarget(target:T) {
        this.target = target;
    }
    public getTarget(game: Game): T {
        return this.target;
    }
    abstract getText(): string;
    abstract getValidTargets(game: Game): Array<T>;
}

export class SingleUnit extends Targeter<Unit> {
    public getValidTargets(game: Game) {
        return game.getBoard().getAllEntities();
    }
    public getText () {
        return 'target unit';
    }
}