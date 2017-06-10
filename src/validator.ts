import * as Ajv from 'ajv';



const pointSchema = {
    "type": "object",
    "properties": {
        "row": {
            "type": "number",
            "minimum": 0,
            "exclusiveMaximum": 100
        },
        "col": {
            "type": "number",
            "minimum": 0,
            "exclusiveMaximum": 100
        }
    }
}

const placeShipSchema = {
    "type": "object",
    "properties": {
        "ship": {
            "type": "number",
            "minimum": 0,
            "exclusiveMaximum": 5
        },
        "dir": {
            "type": "number",
            "minimum": 0,
            "exclusiveMaximum": 4
        },
        "loc": pointSchema
    }
}

const fireParams = {
    "type": "object",
    "properties": {
        "target": pointSchema
    }
}

/**
 * Validates data that comes from the client using JSON schema.
 * 
 * @export
 * @class Validator
 */
export class Validator {
    private ajv = new Ajv(); // options can be passed, e.g. {allErrors: true} 
    private shipParamsValidator: Ajv.ValidateFunction;
    private fireParamsValidator: Ajv.ValidateFunction;

    constructor() {
        this.shipParamsValidator = this.ajv.compile(placeShipSchema);
        this.fireParamsValidator = this.ajv.compile(fireParams);
    }

}