export enum Types {
    integer, string, reference, list
}

export enum Collections {
    card, mechanic
}

const typeRegex = /T-([a-z]+)(?:\/([a-z_]+))?/;

export class Type {
    private type: Types;
    private collection: Collections | null;
    private value: string;

    constructor(type: Types, collection: Collections | null = null) {
        if (type !== Types.reference && collection != undefined)
            console.error('Basic types should not have collections');
        this.type = type;
        this.collection = collection;
    }

    public getType() {
        return this.type;
    }

    public getCollection() {
        return this.collection;
    }

    public encode(): string {
        if (this.type === Types.reference && this.collection)
            return 'T-' + Types[this.type] + '/' + Collections[this.collection];
        return 'T-' + Types[this.type];
    }

    public static decode(str: string): Type | null {
        let match = str.match(typeRegex);
        
        if (match == null)
            return null;
        
        if (match.length === 1) {
            return new Type(Types[match[0]]);
        } else if (match.length === 3) {
            return new Type(Types[match[0]], Collections[match[1]]);
        } else {
            return null;
        }
    }
}

