import { store, Storable } from './store';;
import { Collections, Type, Types } from './dataTypes';
import { Player } from './player';
import { Game2P } from './game2p';
import { Card } from './card';
import { Entity } from './entity';


export enum targetNumber {
    ally, enemy, all
}

export enum targetAlliance {
    one, all
}

export enum targetType {
    self, entity, player, all
}

export class Targeter {
    constructor(private type:targetType, private alliance: targetAlliance, private number: targetNumber) {}

    public getTargets(game: Game2P): Array<Entity | Player> {
        return [];
    }
}

export enum Event {
    onPlay

}

type effect = (targets:Entity | Player, params: Map<string, any>) => void;


export class Mechanic {
    protected params: Map<string, Type>;
    protected requiresEntity: boolean;
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

    public onPlay(game: Game2P) {
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



