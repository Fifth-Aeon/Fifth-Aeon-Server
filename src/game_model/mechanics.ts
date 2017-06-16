import { store, Storable } from './store';;
import { Collections, Type, Types } from './dataTypes';
import { Player } from './player';
import { Game } from './game';
import { Card } from './card';
import { Unit } from './unit';


export enum targetNumber {
    ally, enemy, all
}

export enum targetAlliance {
    one, all
}

export enum targetType {
    self, unit, player, all
}

export class Targeter {
    constructor(private type:targetType, private alliance: targetAlliance, private number: targetNumber) {}

    public getTargets(game: Game): Array<Unit | Player> {
        return [];
    }
}

export enum Event {
    onPlay

}

type effect = (targets:Unit | Player, params: Map<string, any>) => void;


export class Mechanic {
    protected params: Map<string, Type>;
    protected requiresUnit: boolean;
    protected targeter: Targeter;
    protected effects: {
        play:Array<effect>
    };
    protected builtParams: Map<string, any>;

    constructor(private type:targetType,) {
        this.params = new Map<string, Type>();
    }

    public addParam(name:string, type:Type) {
        this.params.set(name, type);
    }

    public onPlay(game: Game) {
        let targets = this.targeter.getTargets(game);
        targets.forEach(target => {
            this.effects.play.forEach(effect => {
                effect(target, this.builtParams);
            })
        })
    }

    public addEffect(event: Event, effect:effect) {
        switch(event) {
            case Event.onPlay:
                this.effects.play.push(effect);
                break;
        }
        
    }

    public setText(text:string) {

    }
}



