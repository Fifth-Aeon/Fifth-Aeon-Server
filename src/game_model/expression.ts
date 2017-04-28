export enum GameDataType {
    number, string, entity, minion, general, player, void
}

export class Variable {
    name: String;
    type: GameDataType;
}

export class Expression {
    constructor(name: string, description: string, public returnType: GameDataType, params: Map<string, GameDataType>, code: string) {
        this.name = name;
        this.description = description;
        this.paramsData = params;
        this.code = code;
    }

    name: string;
    description: string;
    paramsData: Map<string, GameDataType>;
    params: Map<string, Expression>;
    code: string;

    buildDescription() {
        return this.description;
    }

    toJs() {
        let code = this.code;
        this.params.forEach((val, key) => {
            this.code.replace('<' + key + '>', '(' + val.toJs() + ')');
        });
        return code;
    }
}

const damageEffect = new Expression(
    'Deal Damage',
    'Deal <amount> points of damage to <target>.',
    GameDataType.void,
    new Map<string, GameDataType>([
        ['amount', GameDataType.number],
        ['target', GameDataType.entity],
    ]),
    `<target>.takeDamage(this.amount);`
)

/*
let DamageNegationEffect = new Expression(
    'Negate Damage',
    'Negate <negation> points of damage.',
    GameDataType.void,
    new Map<string, GameDataType>([
        ['negation', GameDataType.number]
    ]),
    `trigger(eventParams: Dictionary<string, any>) {
        let oldDamage = eventParams.getValue('damage') as number;
        let negatedDamage = this.effectParams.getValue('amount') as number;
        
        eventParams.setValue('damage', Math.max(oldDamage - negatedDamage, 0));

        return eventParams;
    }`
);
*/

export const expressions = {
    getExpressionOfType(type: GameDataType) {
        return expressionsList.filter(expr => expr.returnType == type);
    }
}

const expressionsList = [
    damageEffect,
    new Expression(
        'Sum', '<op1> + <op2>',
        GameDataType.number,
        new Map<string, GameDataType>([
            ['op1', GameDataType.number],
            ['op2', GameDataType.number]
        ]),
        '<op1> + <op2>'
    ),
    new Expression(
        'Product', '<op1> * <op2>',
        GameDataType.number,
        new Map<string, GameDataType>([
            ['op1', GameDataType.number],
            ['op2', GameDataType.number]
        ]),
        '<op1> * <op2>'
    )
]

