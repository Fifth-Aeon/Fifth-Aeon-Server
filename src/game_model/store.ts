import { Card } from './card';
import { Mechanic } from './mechanics';
import { Collections, Type, Types } from './dataTypes'
const objValues = Object.keys(Collections).map(k => Collections[k]);
const names = objValues.filter(v => typeof v === "string") as string[];

let types = ['card', 'mechanic']


export interface Storable {
    toJson(): string;
    fromJson(raw: object);
    getMetadata(): {
        types: Map<string, Type>,
        values: Map<string, string>
    };
}

export class Store {
    private data: Map<string, Map<string, object>>;

    public registerMechanic(id, mechanic) {
        this.data.get('mechanic').set(id, mechanic);
    }

    private build(type: string, data: object): object {
        let item: Storable;
        switch (type) {
            case 'card':
                item = new Card();
        }
        item.fromJson(data);
        return item;
    }

    private normalize(item: Storable): object {
        if (item.getMetadata() == null)
            return;
        let types = item.getMetadata().types;
        let values = item.getMetadata().values;
        types.forEach((type, name) => {
            if (type.getType() == Types.reference) {
                item[name] = this.data.get(Collections[type.getCollection()]).get(values.get(name));
            }
        })
        return item;
    }

    public loadFromRaw(raw: object) {
        this.data = new Map<string, Map<string, Storable>>();
        for (let name of names) {
            let col = new Map<string, object>()
            for (let prop in raw) {
                col.set(prop, this.build(name, raw[prop]));
            }
            this.data.set(name, col);
        }
        this.data.forEach((collec, type) => {
            if (type == 'mechanic')
                return;
            collec.forEach(item => this.normalize(item as Storable))
        });
    }
}



export const store = new Store();