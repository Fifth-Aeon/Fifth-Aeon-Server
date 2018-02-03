import { db } from "../db";

import { Request, Response, NextFunction } from "express";

function makeAttributeValidator(params: any) {
    return (req: Request, res: Response, next: NextFunction) => {
        let missing = [];
        let body = req.body;
        for (let param of params) {
            if (body[param] === undefined) {
                missing.push(param);
            }
        }
        if (missing.length === 0) {
            next();
            return;
        }
        res.status(400)
            .json({
                'message': 'Request lacks required parameter(s).',
                'missing': missing
            });
    }
}

export const validators = {
    requiredAttributes: makeAttributeValidator
};