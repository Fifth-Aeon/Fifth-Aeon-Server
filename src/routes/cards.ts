import * as express from 'express';
import { passwords } from '../passwords.js';
import { validators } from './validators';
import { saveDeck, saveCollection } from '../models/cards';

const router = express.Router();

router.post('/storeDeck', passwords.authorize, validators.requiredAttributes(['deck']), async (req, res, next) => {
    try {
        saveDeck(req.body.deck, req.user.uid);
    } catch (e) {
        next(e);
    }
});

router.post('/storeCollection', passwords.authorize, validators.requiredAttributes(['collection']), async (req, res, next) => {
    try {
        saveCollection(req.body.collection, req.user.uid);
    } catch (e) {
        next(e);
    }
});

router.get('/getCollection', passwords.authorize, async (req, res, next) => {
    try {

        res.status(403).send('Password Incorrect');
    } catch (e) {
        next(e);
    }
});

export const cardRoutes = router;

