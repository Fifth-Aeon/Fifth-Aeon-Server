import { Server } from "../server";
import { passwords } from "../passwords";
import { db } from "../db";
import { email } from "../email";
import { collectionModel } from "./collection.model";
import { nameGenerator } from "../nameGenerator";

export interface UserData {
    email: string;
    uid: number;
}

export class AuthenticationModel {
    private server?: Server;

    private getAuthenticationResponse(accountID: number, username: string) {
        if (!this.server) {
            throw new Error('Authentication model is not connected to a server instance.');
        }
        let mpAccount = this.server.createMultiplayerUser(username);
        return {
            token: passwords.createUserToken(accountID),
            mpToken: mpAccount.token,
            username: username
        };
    }

    public async getUserdata(accountID: number) {
        let data = (await db.query(
            `
            SELECT accountID as "accountID", username
            FROM CCG.Account
            WHERE accountID = $1;`,
            [accountID]
        )).rows[0];
        return this.getAuthenticationResponse(data.accountID, data.username);
    }

    public async registerAccount(data: {
        password: string;
        username: string;
        email: string;
    }) {
        const passwordData = await passwords.getHashedPassword(data.password);
        const queryResult = await db.query(
            `
            INSERT INTO CCG.Account (
                username,
                email,
                password,
                salt
            ) VALUES ($1, $2, $3, $4)
            RETURNING accountID as "accountID", email;`,
            [
                data.username,
                data.email.toLowerCase(),
                passwordData.hash,
                passwordData.salt
            ]
        );
        let result: { accountID: number; email: string } = queryResult.rows[0];
        email.sendVerificationEmail(
            result.email,
            data.username,
            result.accountID
        );
        await collectionModel.addCollection(result.accountID);
        return this.getAuthenticationResponse(result.accountID, data.username);
    }

    public async createGuestAccount() {
        const guestPassword = passwords.genRandomString(30);
        const username = await nameGenerator.getGuestName();
        const passwordData = await passwords.getHashedPassword(guestPassword);
        const queryResult = await db.query(
            `
            INSERT INTO CCG.Account (
                username,
                role,
                password,
                salt
            ) VALUES ($1, $2, $3, $4)
            RETURNING accountID as "accountID", email;`,
            [username, "guest", passwordData.hash, passwordData.salt]
        );
        let result = queryResult.rows[0];
        await collectionModel.addCollection(result.accountID, true);
        let authResp = this.getAuthenticationResponse(
            result.accountID,
            username
        );
        return {
            token: authResp.token,
            mpToken: authResp.mpToken,
            username: authResp.username,
            password: guestPassword
        };
    }

    public async upgradeGuestAccount(
        user: UserData,
        data: { password: string; username: string; email: string }
    ) {
        const passwordData = await passwords.getHashedPassword(data.password);
        const queryResult = await db.query(
            `
            UPDATE CCG.Account
            SET
                username = $2,
                email = $3,
                password = $4,
                salt = $5,
                role = 'user'
            WHERE accountID = $1 AND role = 'guest'
            RETURNING accountID as "accountID", email;`,
            [
                user.uid,
                data.username,
                data.email.toLowerCase(),
                passwordData.hash,
                passwordData.salt
            ]
        );
        if (queryResult.rowCount === 0) return false;
        let result: { accountID: number; email: string } = queryResult.rows[0];
        collectionModel.rewardPlayer(user, { packs: 2, gold: 0 });
        email.sendVerificationEmail(
            result.email,
            data.username,
            result.accountID
        );
        return this.getAuthenticationResponse(result.accountID, data.username);
    }

    public async login(usernameOrPassword: string, password: string) {
        const queryResult = await db.query(
            `
            SELECT password, salt, accountID as "accountID", username
            FROM CCG.Account
            WHERE username = $1
               OR email    = $1; `,
            [usernameOrPassword]
        );
        if (queryResult.rowCount == 0) throw new Error("No such account");
        const targetUser = queryResult.rows[0];
        const passwordCorrect = await passwords.checkPassword(
            password,
            targetUser.password,
            targetUser.salt
        );
        if (!passwordCorrect) throw new Error("Incorrect password");
        return this.getAuthenticationResponse(
            targetUser.accountID,
            targetUser.username
        );
    }

    public setServer(server: Server) {
        this.server = server;
    }
}

export const authenticationModel = new AuthenticationModel();
