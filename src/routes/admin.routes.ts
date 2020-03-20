import * as express from "express";

import { passwords } from "../passwords";
import { adminModel } from "../models/admin.model";

const router = express.Router();

router.get(
    "/userData",
    passwords.authorizeAtLevel("admin"),
    async (req, res, next) => {
        try {
            res.json(await adminModel.getUserData());
        } catch (e) {
            next(e);
        }
    }
);

router.get(
    "/cardData",
    passwords.authorizeAtLevel("admin"),
    async (req, res, next) => {
        try {
            res.json(await adminModel.getCardData());
        } catch (e) {
            next(e);
        }
    }
);

router.get(
    "/oldAccounts",
    passwords.authorizeAtLevel("admin"),
    async (req, res, next) => {
        try {
            res.json(await adminModel.getOldAccounts());
        } catch (e) {
            next(e);
        }
    }
);

router.delete(
    "/oldAccounts",
    passwords.authorizeAtLevel("admin"),
    async (req, res, next) => {
        try {
            res.json(await adminModel.deleteOldAccounts());
        } catch (e) {
            next(e);
        }
    }
);


export const adminRouter = router;
