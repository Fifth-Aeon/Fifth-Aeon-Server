import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { config } from "./config";
import { db } from "./db";
import { UserData } from "./models/authentication.model";

interface PasswordHash {
    hash: string;
    salt: string;
}

class PasswordGenerator {
    constructor() {
        this.secret = config.jwtSecret || "";
        this.authorize = this.needsAuth.bind(this);
    }
    private static expirationTime = 60 * 60 * 24 * 7; // 1 week
    private secret: string;
    public authorize: (req: Request, res: Response, next: NextFunction) => void;

    public authorizeAtLevel(level: string) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const userData = jwt.verify(
                    req.header("token") || "",
                    this.secret
                ) as UserData;
                (req as any).user = userData;
                const query = await db.query(
                    `SELECT (role >= $1) as authorized FROM CCG.Account WHERE accountID = $2;`,
                    [level, userData.uid]
                );
                if (query.rowCount > 0 && query.rows[0].authorized) {
                    next();
                } else {
                    res.status(403).send("Requires higher user role");
                }
            } catch (e) {
                res.status(401).send("Requires Authentication");
            }
        };
    }

    public createUserToken(accountID: number) {
        return this.signJWT({ uid: accountID });
    }

    public createEmailVerificationToken(accountID: number) {
        console.log({ uid: accountID, email: true });
        return this.signJWT({ uid: accountID, email: true });
    }

    public createPasswordResetToken(accountID: number) {
        return this.signJWT({ uid: accountID, pass: true });
    }

    private needsAuth(req: Request, res: Response, next: NextFunction) {
        try {
            (req as any).user = jwt.verify(
                req.header("token") || "",
                this.secret
            );
            next();
        } catch (e) {
            res.status(401).send("Requires Authentication");
        }
    }

    private signJWT(payload: any) {
        return jwt.sign(payload, this.secret, {
            expiresIn: PasswordGenerator.expirationTime
        });
    }

    public genRandomString(length: number) {
        return crypto
            .randomBytes(Math.ceil(length / 2))
            .toString("hex")
            .slice(0, length);
    }

    public getHashedPassword = (password: string) => {
        const salt = this.genRandomString(32);
        return new Promise<PasswordHash>((fulfill, reject) => {
            crypto.pbkdf2(
                password,
                salt,
                100000,
                128,
                "sha512",
                (err, derivedKey) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    fulfill({
                        hash: derivedKey.toString("base64"),
                        salt: salt
                    });
                }
            );
        });
    }

    public checkPassword = (candidate: string, hash: string, salt: string) => {
        return new Promise((fulfill, reject) => {
            crypto.pbkdf2(
                candidate,
                salt,
                100000,
                128,
                "sha512",
                (err, derivedKey) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    fulfill(derivedKey.toString("base64") === hash);
                }
            );
        });
    }
}

export const passwords = new PasswordGenerator();
