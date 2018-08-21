import *  as express from 'express';
import { draftModel } from 'models/draft.model.js';
import { UserData } from 'models/authentication.model.js';
import { passwords } from 'passwords.js';

const router = express.Router();

router.post('/startDraft', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        const result = await draftModel.startDraft(user);
        if (typeof result !== 'string')
            res.json({
                message: 'Draft started',
                data: result
            });
        else 
            res.status(400).json({
                message: 'Cannot start draft: ' + result
            });
    } catch (e) {
        next(e);
    }
});

router.post('/updateDraft', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        await draftModel.updateDraft(user, req.body.draftData);
        res.json({message: 'success'});
    } catch (e) {
        next(e);
    }
});

router.get('/getDraft', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        let draftData = await draftModel.getDraft(user);
        if (!draftData)
            return res.status(400).json({message: 'no data'});
        res.json({message: 'success', draftData: draftData});
    } catch (e) {
        next(e);
    }
});

router.post('/endDraft', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        const reward = await draftModel.endDraft(user, req.body.draftData);
        res.json({message: 'success', reward});
    } catch (e) {
        next(e);
    }
});

export const draftRouter = router;

