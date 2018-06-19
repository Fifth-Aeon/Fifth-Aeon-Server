import * as express from 'express';
import { db } from '../db';
import { email } from '../email';
import { authenticationModel, UserData } from '../models/authentication.model';
import { rewardPlayer } from '../models/cards';
import { passwords } from '../passwords.js';
import { validators } from './validators';

const router = express.Router();


router.post('/register', validators.requiredAttributes(['username', 'email', 'password']), async (req, res, next) => {
    try {
        const response = await authenticationModel.registerAccount(req.body);
        res.status(201)
            .json(response);
    } catch (e) {
        next(e);
    }
});

router.post('/upgradeGuest', passwords.authorize, validators.requiredAttributes(['username', 'email', 'password']), async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        const response = await authenticationModel.upgradeGuestAccount(user, req.body);
        res.status(201)
            .json(response);
    } catch (e) {
        next(e);
    }
});

router.post('/registerGuest', async (req, res, next) => {
    try {
        const response = await authenticationModel.createGuestAccount();
        res.status(201)
            .json(response);
    } catch (e) {
        next(e);
    }
});

router.post('/login', validators.requiredAttributes(['usernameOrEmail', 'password']), async (req, res, next) => {
    try {
        const result = await authenticationModel.login(req.body.usernameOrEmail, req.body.password);
        res.status(200)
            .json(result);
    } catch (e) {
        next(e);
    }
});

router.get('/userdata', passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        const result = await authenticationModel.getUserdata(user.uid);
        res.status(200)
            .json(result);
    } catch (e) {
        next(e);
    }
});

router.post('/verifyEmail', passwords.authorize, async (req, res, next) => {
    try {
        let user: UserData = (req as any).user;
        if (user.email && user.uid) {
            const verificationResult = await db.query(`
                UPDATE CCG.Account
                SET emailVerified = true
                WHERE accountID = $1
                  AND emailVerified = false;
            `, [user.uid]);

            if (verificationResult.rowCount === 1) {
                rewardPlayer(user, { packs: 2, gold: 0 });
            }

            res.status(200).json({
                message: 'done'
            });
        } else {
            res.sendStatus(403);
        }
    } catch (err) {
        next(err);
    }
});

router.post('/verifyReset', passwords.authorize, validators.requiredAttributes(['password']), async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        const passwordData = await passwords.getHashedPassword(req.body.password);
        const queryResult = await db.query(`
            UPDATE CCG.Account 
            SET password = $1, salt = $2 
            WHERE accountID = $3
            RETURNING username;`, [
                passwordData.hash,
                passwordData.salt,
                user.uid
            ]);

        res.status(200)
            .json({
                token: passwords.createUserToken(user.uid),
                username: queryResult.rows[0].username
            });
    } catch (err) {
        next(err);
    }
});

router.post('/requestReset', validators.requiredAttributes(['usernameOrEmail']), async (req, res, next) => {
    try {
        const queryResult = await db.query(`
            SELECT email, accountID 
            FROM CCG.Account 
            WHERE username = $1
               OR email    = $1`, [req.body.usernameOrEmail]);
        if (queryResult.rowCount === 0) {
            res.status(400)
                .json({
                    account: req.body.usernameOrEmail,
                    message: 'No such account'
                });
            return;
        }
        let result = queryResult.rows[0];
        email.sendPasswordResetEmail(result.email, result.accountid);
        res.json({ message: 'Reset email sent' });
    } catch (err) {
        next(err);
    }
});


router.get('/testAuth', passwords.authorize, async (req, res) => {
    res.json((req as any).user);
});

export const authRoutes = router;
