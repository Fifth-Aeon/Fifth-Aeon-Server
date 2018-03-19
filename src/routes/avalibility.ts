const express = require('express');
const router = express.Router();
const validators = require('./validators');
import { db } from "../db";
import { NextFunction, Request, Response } from "express";


/**
 * Checks if a certain table has a row with the given attribute.
 * This is useful so the client can immediatly provide feedback on
 * whether a certain unique key is avalible.
 *
 * @param {string} table The table whose attribute we are checking
 * @param {string} attribute The key of the table
 * @param {boolean} caseInsensitive Whether the search should ignore capitiization
 * @returns {function(Request, Response, NextFunction): void} Route handler that checks the attribute
 */
const checkAvalibility = (table: string, attribute: string, caseInsensitive: boolean) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sql = caseInsensitive ?
                `SELECT ${attribute} FROM CCG.${table} WHERE LOWER(${attribute})=LOWER($1)` :
                `SELECT ${attribute} FROM CCG.${table} WHERE ${attribute}=$1`;
            const query = await db.query(sql, [req.params[attribute]]);
            res.json({
                available: query.rowCount === 0
            });
        } catch (err) {
            next(err);
            return;
        }
    };
};

router.get('/emailorpassword/:nameOrPass', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nameOrPass = req.params.nameOrPass.toString();
        const query = await db.query(`
            SELECT accountID 
            FROM CCG.Account 
            WHERE LOWER(username) = LOWER($1)
               OR LOWER(email)    = LOWER($2)`, [nameOrPass, nameOrPass.toLowerCase()]);
        res.json({
            available: query.rowCount === 0
        });
    } catch (err) {
        next(err);
        return;
    }
});

router.get('/email/:email', checkAvalibility('Account', 'email', true));
router.get('/username/:username', checkAvalibility('Account', 'username', true));


export const avalibilityRoutes = router;
