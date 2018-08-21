import * as express from 'express';
import { passwords } from 'passwords.js';
import { validators } from './validators.js';
import { collectionModel } from 'models/collection.model.js';
import { Collection } from 'game_model/collection.js';
import { UserData } from 'models/authentication.model.js';

const router = express.Router();


router.get('/checkDaily', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        const result = await collectionModel.checkDailyRewards(user);
        if (typeof result !== 'number')
            res.status(200)
                .json({
                    daily: true,
                    cards: result
                });
        else
            res.status(200)
                .json({
                    daily: false,
                    nextRewardTime: result
                });
    } catch (e) {
        next(e);
    }
});


router.post('/reward', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        let collection = new Collection(await collectionModel.getCollection(user.uid));
        let reward = collection.addWinReward(req.body.won);
        await collectionModel.saveCollection(collection.getSavable(), user.uid);
        res.json(reward);
    } catch (e) {
        next(e);
    }
});

router.post('/openPack', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        let collection = new Collection(await collectionModel.getCollection(user.uid));
        if (!collection.canOpenBooster()) {
            res.status(400).json({ message: 'No packs to open.' });
            return;
        }
        let packContents = collection.openBooster()
        await collectionModel.saveCollection(collection.getSavable(), user.uid);
        res.json(packContents);
    } catch (e) {
        next(e);
    }
});


router.post('/buy', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        let collection = new Collection(await collectionModel.getCollection(user.uid));
        if (!collection.canBuyPack()) {
            res.status(400).json({
                msg: 'Not enough gold to buy that.',
                packs: collection.getPackCount(),
                gold: collection.getGold()
            });
            return;
        }
        collection.buyPack()
        await collectionModel.saveCollection(collection.getSavable(), user.uid);
        res.status(200).json({
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
            id: await collectionModel.saveDeck(req.body.deck, user.uid)
        });
    } catch (e) {
        next(e);
    }
});

router.post('/deleteDeck', passwords.authorize, validators.requiredAttributes(['id']), async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        await collectionModel.deleteDeck(user.uid, req.body.id);
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

router.get('/getDecks', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        res.json(await collectionModel.getDecks(user.uid));
    } catch (e) {
        next(e);
    }
});

router.post('/storeCollection', passwords.authorize, validators.requiredAttributes(['collection']), async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        await collectionModel.saveCollection(req.body.collection, user.uid);
        res.type('html')
            .sendStatus(200);
    } catch (e) {
        next(e);
    }
});

router.get('/getCollection', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        res.json(await collectionModel.getCollection(user.uid));
    } catch (e) {
        next(e);
    }
});

export const cardRoutes = router;

