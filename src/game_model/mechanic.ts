import { Collections, Type, Types } from './dataTypes';
import { Player } from './player';
import { Game } from './game';
import { Card } from './card';
import { Unit } from './unit';




export abstract class Mechanic {
    abstract run(parent: Card, game:Game): void;
    abstract getText(parent: Card,): string;
}



