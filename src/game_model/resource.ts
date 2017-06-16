export const ResourceType = {
    "Astral": "Astral",
    "Primeval": "Primeval",
    "Necrotic": "Necrotic",
    "Radiant": "Radiant"
}

export class Resource {
    private types: Map<string, number>;
    private numeric: number;
    private maxNumeric: number;

    constructor(maxNumeric?: number, types?: Map<string, number>, numeric?: number) {
        this.maxNumeric = maxNumeric || 1;
        this.numeric = numeric || this.maxNumeric;
        this.types = types || new Map<string, number>();
    }

    toString(): string {
        return this.numeric.toString();
    }

    public meetsReq(req: Resource): boolean {
        let ok = true;
        req.types.forEach((necReq, req) => {
            if (this.types.get(req) || 0 < necReq)
                ok = false
        })
        return ok && this.numeric > req.maxNumeric;
    }

    public addRes(res: Resource) {
        res.types.forEach((amount, resType) => {
            this.types.set(resType, (this.types.get(resType) || 0) + amount)
        })
        this.numeric += res.numeric;
        this.maxNumeric += res.maxNumeric;
    }
}