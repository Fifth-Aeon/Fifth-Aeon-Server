import { Server } from "../server";
import { passwords } from "../passwords";
import { db } from "../db";
import { email } from "../email";
import { addCollection } from "./cards";
import { nameGenerator } from "../nameGenerator";

export interface UserData {
    email: string;
    uid: number;
}


export class AuthenticationModel {
    private server: Server;

    private getAuthenticationResponse(accountID: number, username: string) {
        let mpAccount = this.server.createMultiplayerUser(username);
        return {
            token: passwords.createUserToken(accountID),
            mpToken: mpAccount.token,
            username: username
        }
    }

    public async getUserdata(accountID: number) {
        let data = (await db.query(`
            SELECT accountID as "accountID", username
            FROM CCG.Account 
            WHERE accountID = $1;`, [accountID])).rows[0]
        return this.getAuthenticationResponse(data.accountID, data.username);
    }

    public async registerAccount(data: { password: string, username: string, email: string }) {
        const passwordData = await passwords.getHashedPassword(data.password);
        const queryResult = await db.query(`
            INSERT INTO CCG.Account (
                username,
                email,
                password,
                salt
            ) VALUES ($1, $2, $3, $4)
            RETURNING accountID as "accountID", email;`, [
                data.username,
                data.email.toLowerCase(),
                passwordData.hash,
                passwordData.salt
            ]);
        let result = queryResult.rows[0];
        email.sendVerificationEmail(result.email, result.accountid);
        await addCollection(result.accountID);
        return this.getAuthenticationResponse(result.accountID, data.username);
    }

    public async createGuestAccount() {
        const guestPass = passwords.genRandomString(30);
        const username = nameGenerator.getName();
        const passwordData = await passwords.getHashedPassword(guestPass);
        const queryResult = await db.query(`
            INSERT INTO CCG.Account (
                username,
                email,
                password,
                salt
            ) VALUES ($1, $2, $3, $4)
            RETURNING accountID as "accountID", email;`, [
                username,
                '',
                passwordData.hash,
                passwordData.salt
            ]);
        let result = queryResult.rows[0];
        await addCollection(result.accountID);
        return this.getAuthenticationResponse(result.accountID, username);
    }

    public async login(usernameOrPassword: string, password: string) {
        const queryResult = await db.query(`
            SELECT password, salt, accountID as "accountID", username
            FROM CCG.Account 
            WHERE username = $1
               OR email    = $1; `, [usernameOrPassword]);
        if (queryResult.rowCount == 0)
            throw new Error('No such account');
        const targetUser = queryResult.rows[0];
        const passwordCorrect = await passwords.checkPassword(password, targetUser.password, targetUser.salt);
        if (!passwordCorrect)
            throw new Error('Incorrect password');
        return this.getAuthenticationResponse(targetUser.accountID, targetUser.username);

    }

    public setServer(server: Server) {
        this.server = server;
    }

}

export const authenticationModel = new AuthenticationModel();