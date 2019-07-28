import { db } from "../db";

export interface AccountData {
    username: string;
    role: "guest" | "user" | "mod" | "admin";
    joined: Date;
    lastActive: Date;
}

class AdminModel {
    public async getUserData(): Promise<AccountData[]> {
        return (await db.query(
            `SELECT
                username,
                role,
                joined,
                lastActive as "lastActive"
            FROM CCG.Account;`
        )).rows;
    }

    public async getCardData() {
        const cardCount = (await db.query(`SELECT count(*) FROM CCG.card;`))
            .rows[0].count as number;
        const publicCardCount = (await db.query(`SELECT count(*) FROM CCG.card as C, CCG.setMembership as M, CCG.set as S
        WHERE S.public
          AND M.setID = S.id
          AND M.cardID = C.id;`)).rows[0].count as number;
        return { cardCount, publicCardCount };
    }
}

export const adminModel = new AdminModel();
