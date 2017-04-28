import { Modifier } from '../modifier';
import { EventType } from '../game-event';
import { Condition } from './condition';
import { Variable, Expression } from './expression';



export class Trigger {
    events: Array<EventType>;
    variables: Array<Variable>;
    effects: Array<Expression>;
    conditions: Array<Condition>;

    constructor() {
        this.events = [];
        this.variables = [];
        this.effects = [];
        this.conditions = [];
    }
}
