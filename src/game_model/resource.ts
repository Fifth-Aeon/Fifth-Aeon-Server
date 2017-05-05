export class Resource {
    private types: Map<string, number>;
    private numeric: number;
    private maxNumeric: number;

    constructor(maxNumeric?: number, types?: Map<string, number>, numeric?: number) {
        this.maxNumeric = maxNumeric || 1;
        this.numeric = numeric || maxNumeric;
        this.types = types || new Map<string, number>();
    }

    public meetsReq(req: Resource): boolean {
        let ok = true;
        req.types.forEach((necReq, req) => {
            if (this.types.get(req) < necReq)
                ok = false
        })
        return ok && this.numeric > req.maxNumeric;
    }

    public addRes(res: Resource) {
        res.types.forEach((amount, resType) => {
            this.types.set(resType, this.types.get(resType) + amount)
        })
        this.numeric += res.numeric;
        this.maxNumeric += res.maxNumeric;
    }
}