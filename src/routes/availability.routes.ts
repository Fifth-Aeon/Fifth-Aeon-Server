const express = require("express");
const router = express.Router();
import { db } from "../db";
import { NextFunction, Request, Response } from "express";

/**
 * Checks if a certain table has a row with the given attribute.
 * This is useful so the client can immediately provide feedback on
 * whether a certain unique key is available.
 *
 * @param table The table whose attribute we are checking
 * @param attribute The key of the table
 * @param caseInsensitive Whether the search should ignore capitalization
 * @returns Route handler that checks the attribute
 */
const checkAvailability = (
    table: string,
    attribute: string,
    caseInsensitive: boolean
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sql = caseInsensitive
                ? `SELECT ${attribute} FROM CCG.${table} WHERE LOWER(${attribute})=LOWER($1)`
                : `SELECT ${attribute} FROM CCG.${table} WHERE ${attribute}=$1`;
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

router.get(
    "/emailorpassword/:nameOrPass",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const nameOrPass = req.params.nameOrPass.toString();
            const query = await db.query(
                `
            SELECT accountID
            FROM CCG.Account
            WHERE LOWER(username) = LOWER($1)
               OR LOWER(email)    = LOWER($2)`,
                [nameOrPass, nameOrPass.toLowerCase()]
            );
            res.json({
                available: query.rowCount === 0
            });
        } catch (err) {
            next(err);
            return;
        }
    }
);

router.get("/email/:email", checkAvailability("Account", "email", true));
router.get(
    "/username/:username",
    checkAvailability("Account", "username", true)
);

export const availabilityRoutes = router;
