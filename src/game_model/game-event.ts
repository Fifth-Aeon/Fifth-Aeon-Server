import { remove } from 'lodash';

import { Mechanic } from './mechanic';
import { Game } from './game';


export enum EventType {
    onDamaged, onDeath, onPlay, onAttack, onKillingAttack,
    onStartOfTurn, onEndOfTurn, onMinionSummoned, onMinionDeath
}

// Damaged, Death, Enter, Attacks, Counterattacks, Start of turn, End of turn, Minion summones, kills 

export class GameEvent {
    public source: Mechanic | null;
    constructor(
        public type: EventType,
        public trigger: (params: Map<string, any>) => Map<string, any>
    ) { }
}


export class EventGroup {
    private events: Map<EventType, Array<GameEvent>>

    constructor() {
        this.events = new Map<EventType, Array<GameEvent>>();
    }

    public addEvent(source: Mechanic | null, event: GameEvent) {
        event.source = source;
        let events = this.events.get(event.type);
        if (!events) {
            this.events.set(event.type, []);
            events = this.events.get(event.type) || [];
        }
        events.push(event);
        event.source = source;
    }

    public trigger(type: EventType, params: Map<string, any>) {
        let events = this.events.get(type) || [];
        events.forEach(event => {
            event.trigger(params);
        })
        return params;
    }

    public removeEvents(source: Mechanic) {
        let allEvents = Array.from(this.events.values());
        allEvents.forEach(eventList => remove(eventList, event => event.source == source))
    }
}
