import { Expression } from '@angular/compiler/src/output/output_ast';
import { Dictionary } from 'typescript-collections'
import { remove }     from 'lodash';

import { Modifier }   from './modifier';

export enum EventType {
    onDamaged, onDeath, onPlay, onAttack, onKillingAttack,
    onStartOfTurn, onEndOfTurn, onMinionSummoned, onMinionDeath
}

// Damaged, Death, Enter, Attacks, Counterattacks, Start of turn, End of turn, Minion summones, kills 

export class GameEvent {
    type: EventType;
    source: Modifier;
    effects: Array<Expression>;
    trigger(params: Dictionary<string, any>): Dictionary<string, any> {
        let effects = this.effects || [];
        effects.forEach(event => {
            //event.trigger(params);
        })
        return params;
    }
}

 
export class EventGroup {
    private events: Dictionary<EventType, Array<GameEvent>>

    constructor() {
        this.events = new Dictionary<EventType, Array<GameEvent>>();
    }

    makeParams(obj: Object): Dictionary<string, any> {
        let dict = new Dictionary<string, any>();
        for (let prop in obj) {
            dict.setValue(prop, obj[prop]);
        }
        return dict;
    }

    addEvent(source: Modifier, event: GameEvent) {
        if (!this.events.containsKey(event.type))
            this.events.setValue(event.type, []);
        this.events.getValue(event.type).push(event);
        event.source = source;
    }

    trigger(type: EventType, params: Dictionary<string, any>) {
        let events = this.events.getValue(type) || [];
        events.forEach(event => {
            event.trigger(params);
        })
        return params;
    }

    removeModifierEvents(source: Modifier) {
        let allEvents = this.events.values();
        allEvents.forEach(eventList => remove(eventList, event => event.source == source))
    }

    addModifierEvents(source: Modifier) {
        source.events.forEach(event => this.addEvent(source, event));
    }
}
