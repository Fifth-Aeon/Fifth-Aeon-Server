import * as express from "express";

import { UserData } from "../models/authentication.model";
import { passwords } from "../passwords";
import { validators } from "./validators";
import { moddingModel } from "models/mods.model";

const router = express.Router();

router.post(
    "/insertOrUpdateCard",
    passwords.authorize,
    validators.requiredAttributes(["cardData"]),
    async (req, res, next) => {
        try {
            const user: UserData = (req as any).user;
            const result = await moddingModel.insertOrUpdateCard(
                user,
                req.body.cardData
            );
            res.status(result ? 200 : 400).json();
        } catch (e) {
            next(e);
        }
    }
);

// getUserCards
router.get("/getUserCards", passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        res.json(await moddingModel.getUserCards(user));
    } catch (e) {
        next(e);
    }
});

// createSet
router.post(
    "/createSet",
    passwords.authorize,
    validators.requiredAttributes(["setInfo"]),
    async (req, res, next) => {
        try {
            const user: UserData = (req as any).user;
            const result = await moddingModel.createSet(
                user,
                req.body.setInfo
            );
            res.status(result ? 200 : 400).json();
        } catch (e) {
            next(e);
        }
    }
);

// modifySetPublicity
router.post(
    "/modifySetPublicity",
    passwords.authorize,
    validators.requiredAttributes(["setId", "isPublic"]),
    async (req, res, next) => {
        try {
            const user: UserData = (req as any).user;
            const result = await moddingModel.modifySetPublicity(
                user,
                req.body.setId,
                req.body.isPublic
            );
            res.status(result ? 200 : 400).json();
        } catch (e) {
            next(e);
        }
    }
);

// getPublicSets
router.get("/publicSets", async (req, res, next) => {
    try {
        res.json(await moddingModel.getPublicSets());
    } catch (e) {
        next(e);
    }
});

// getPublicSet
router.get("/publicSet/:setId", async (req, res, next) => {
    try {
        res.json(await moddingModel.getPublicSet(req.params.setId));
    } catch (e) {
        next(e);
    }
});

// addCardToSet
router.post(
    "/addCardToSet",
    passwords.authorize,
    validators.requiredAttributes(["cardId", "setId"]),
    async (req, res, next) => {
        try {
            const user: UserData = (req as any).user;
            const result = await moddingModel.addCardToSet(
                user,
                req.body.cardId,
                req.body.setId
            );
            res.status(result ? 200 : 400).json();
        } catch (e) {
            next(e);
        }
    }
);

export const moddingRouter = router;
