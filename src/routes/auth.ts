import { db } from '../db';
import { passwords } from '../passwords.js';
import * as express from 'express';
import { Response } from 'express';

const router = express.Router();

async function isUsernameAvalible(username: string) {
    let res = await db.query(`SELECT username FROM CCG.Account WHERE username = $1;`, [username]);
    return res.rowCount === 0;
}

async function isEmailAvalible(email: string) {
    let res = await db.query(`SELECT email FROM CCG.Account WHERE email = $1;`, [email]);
    return res.rowCount === 0;
}

function hasRequiredAttributes(body: any, params: string[], res: Response) {
    let missing: string[] = [];
    for (let param of params) {
        if (body[param] === undefined) {
            missing.push(param);
        }
    }
    if (missing.length === 0)
        return true;
    res.status(400)
        .type('application/json')
        .send({
            'message': 'Request lacks required parameter(s).',
            'missing': missing
        });
    return false;
}

/* Register new user */
router.post('/register', async (req, res, next) => {
    try {
        if (!hasRequiredAttributes(req.body, ['username', 'email', 'password'], res)) return;
        const passwordData = await passwords.getHashedPassword(req.body.password);
        await db.query(`
        INSERT INTO CCG.Account (
            username,
            email,
            password,
            salt
        ) VALUES ($1, $2, $3, $4, $5);`, [
                req.body.username,
                req.body.email,
                passwordData.hash,
                passwordData.salt
            ]);
        const idQuery = await db.query('SELECT accountID FROM CCG.Account WHERE username = $1', [req.body.username])
        res.status(201)
            .type('application/json')
            .send({ token: passwords.createUserToken(idQuery.rows[0].accountid) });
    } catch (e) {
        console.error(e);
        res.status(500)
            .send('Could not reigster user');
    }
});

/* Register new user */
router.post('/login', async (req, res, next) => {
    try {
        if (!hasRequiredAttributes(req.body, ['username', 'password'], res)) return;
        const queryResult = await db.query(`
        SELECT password, salt, accountID FROM CCG.Account 
        WHERE username = $1;`, [req.body.username]);

        if (queryResult.rowCount === 0) {
            res.status(400)
                .send('No such user');
            return;
        }

        const result = queryResult.rows[0];
        if (!await passwords.checkPassword(req.body.password, result.password, result.salt)) {
            res.status(403)
                .send('Password does not match');
            return;
        }
        res.status(200)
            .type('application/json')
            .send({ token: passwords.createUserToken(result.accountid) });
    } catch (e) {
        console.error(e);
        res.status(500)
            .send('Could not login user');
    }
});


/* Verify a users email (expects an email verifcation token, not a regular user token) */
router.post('/verifyEmail', passwords.authorize, async (req, res) => {
    try {
        if (req.user.email) {
            await db.query(`
                UPDATE table_name
                SET emailVerified = true
                WHERE accountID = $1;
            `, [req.user.accountID]);
            res.sendStatus(200);
        } else {
            res.sendStatus(403);
        }
    } catch (err) {
        res.sendStatus(500);
    }
});

/* Tell the client of an email is availbile */
router.get('/emailAvalible', async (req, res) => {
    try {
        if (!hasRequiredAttributes(req.body, ['email'], res)) return;
        const ok = await isEmailAvalible(req.body.email);
        res.status(200)
            .type('application/json')
            .send({ ok: ok });
    } catch (err) {
        res.status(500)
            .send('Internal Failure');
    }
});

/* Tell the client of a username is availbile */
router.get('/usernameAvalible', async (req, res) => {
    try {
        if (!hasRequiredAttributes(req.body, ['username'], res)) return;
        const ok = await isUsernameAvalible(req.body.username);
        res.status(200)
            .type('application/json')
            .send({ ok: ok });
    } catch (err) {
        res.status(500)
            .send('Internal Failure');
    }
});

export const authRoutes = router;
