const express = require('express');
const router = express.Router();
const validators = require('./validators');
import { db } from "../db";
import { NextFunction, Request, Response } from "express";


function checkAvalibility(table: string, attribute: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = await db.query(`SELECT ${attribute} FROM CCG.${table} WHERE ${attribute}=$1`, [req.params[attribute]]);
            res.json({
                availbile: query.rowCount === 0
            });
        } catch (err) {
            next(err);
        }
    };
}

router.get('/email/:email', checkAvalibility('Account', 'email'));
router.get('/username/:username', checkAvalibility('Account', 'username'));


export const avalibilityRoutes = router;
