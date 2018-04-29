import * as express from 'express';
import { passwords } from '../passwords.js';
import { validators } from './validators';
import { saveDeck, saveCollection, getCollection, getDecks, deleteDeck } from '../models/cards';
import { Collection } from '../game_model/collection.js';
import { UserData } from '../models/authentication.model.js';

const router = express.Router();

router.post('/reward', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        let collection = new Collection(await getCollection(user.uid));
        let reward = collection.addWinReward(req.body.won);
        await saveCollection(collection.getSavable(), user.uid);
        res.json(reward);
    } catch (e) {
        next(e);
    }
});

router.post('/openPack', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        let collection = new Collection(await getCollection(user.uid));
        if (!collection.canOpenBooster()) {
            res.status(400).json({ message: 'No packs to open.' });
            return;
        }
        let packContents = collection.openBooster()
        await saveCollection(collection.getSavable(), user.uid);
        res.json(packContents);
    } catch (e) {
        next(e);
    }
});


router.post('/buy', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        let collection = new Collection(await getCollection(user.uid));
        if (!collection.canBuyPack()) {
            res.status(400).send({
                msg: 'Not enough gold to buy that.',
                packs: collection.getPackCount(),
                gold: collection.getGold()
            });
            return;
        }
        collection.buyPack()
        await saveCollection(collection.getSavable(), user.uid);
        res.sendStatus(200).json({
            packs: collection.getPackCount(),
            gold: collection.getGold()
        });
    } catch (e) {
        next(e);
    }
});

router.post('/storeDeck', passwords.authorize, validators.requiredAttributes(['deck']), async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        res.json({
            id: await saveDeck(req.body.deck, user.uid)
        });
    } catch (e) {
        next(e);
    }
});

router.post('/deleteDeck', passwords.authorize, validators.requiredAttributes(['id']), async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        await deleteDeck(user.uid, req.body.id);
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

router.get('/getDecks', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        res.json(await getDecks(user.uid));
    } catch (e) {
        next(e);
    }
});

router.post('/storeCollection', passwords.authorize, validators.requiredAttributes(['collection']), async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        await saveCollection(req.body.collection, user.uid);
        res.type('html')
            .sendStatus(200);
    } catch (e) {
        next(e);
    }
});

router.get('/getCollection', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        res.json(await getCollection(user.uid));
    } catch (e) {
        next(e);
    }
});

export const cardRoutes = router;

