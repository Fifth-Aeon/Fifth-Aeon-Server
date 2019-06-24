import { NextFunction, Request, Response } from "express";

function makeAttributeValidator(params: any) {
    return (req: Request, res: Response, next: NextFunction) => {
        const missing = [];
        const body = req.body;
        for (const param of params) {
            if (body[param] === undefined) {
                missing.push(param);
            }
        }
        if (missing.length === 0) {
            next();
            return;
        }
        res.status(400).json({
            message: "Request lacks required parameter(s).",
            missing: missing
        });
    };
}

export const validators = {
    requiredAttributes: makeAttributeValidator
};
