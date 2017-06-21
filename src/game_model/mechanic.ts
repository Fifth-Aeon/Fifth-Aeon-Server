import { Game } from './game';
import { Card } from './card';

export abstract class Mechanic {
    abstract run(parent: Card, game:Game): void;
    abstract getText(parent: Card): string;
}