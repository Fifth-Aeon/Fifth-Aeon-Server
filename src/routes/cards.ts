import * as express from 'express';
import { passwords } from '../passwords.js';
import { validators } from './validators';
import { saveDeck, saveCollection, getCollection, getDecks, deleteDeck } from '../models/cards';

const router = express.Router();

router.post('/storeDeck', passwords.authorize, validators.requiredAttributes(['deck']), async (req, res, next) => {
    try {
        res.json({
            id: await saveDeck(req.body.deck, req.user.uid)
        });
    } catch (e) {
        next(e);
    }
});

router.post('/deleteDeck', passwords.authorize, validators.requiredAttributes(['id']), async (req, res, next) => {
    try {
        await deleteDeck(req.user.uid, req.body.id);
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

router.get('/getDecks', passwords.authorize, async (req, res, next) => {
    try {
        res.json(await getDecks(req.user.uid));
    } catch (e) {
        next(e);
    }
});

router.post('/storeCollection', passwords.authorize, validators.requiredAttributes(['collection']), async (req, res, next) => {
    try {
        await saveCollection(req.body.collection, req.user.uid);
        res.type('html')
            .sendStatus(200);
    } catch (e) {
        next(e);
    }
});

router.get('/getCollection', passwords.authorize, async (req, res, next) => {
    try {
        res.json(await getCollection(req.user.uid));
    } catch (e) {
        next(e);
    }
});

export const cardRoutes = router;

