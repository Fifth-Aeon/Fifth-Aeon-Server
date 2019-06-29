import { db } from "../db";
import { UserData } from "./authentication.model";
import { CardData } from "../game_model/cards/cardList";
import { SetInformation, CardSet } from "game_model/cardSet";

class ModdingModel {
    public async getActiveSets(user: UserData) {
        return (await db.query(
            `SELECT
                id,
                setName as "name",
                setDescription as "description",
                array(
                    SELECT CR.cardData as "cardData"
                    FROM CCG.Card as CR, CCG.SetMembership as SM
                    WHERE SM.setID = SA.setID
                    AND SM.cardID = CR.id) as cards
            FROM CCG.SetActive as SA, CCG.Set as ST
            WHERE accountID = $1
            AND id = setID;`,
            [user.uid]
        )).rows as CardSet[];
    }

    public async deactivateSet(user: UserData, setId: string) {
        return db.query(
            `DELETE FROM CCG.SetActive
            WHERE SetID = $1
              AND AccountID = $2;`,
            [setId, user.uid]
        );
    }

    public async activateSet(user: UserData, setId: string) {
        return db.query(
            `INSERT INTO CCG.SetActive (SetID, AccountID) VALUES ($1, $2);`,
            [setId, user.uid]
        );
    }

    public async insertOrUpdateCard(user: UserData, data: CardData) {
        if (!(await this.canModifyCard(user, data.id))) {
            return false;
        }
        return db.query(
            `INSERT INTO CCG.Card(id, ownerID, cardData)
            VALUES($1, $2, $3)
            ON CONFLICT ON CONSTRAINT card_pkey
            DO UPDATE
                SET cardData = $3
                WHERE Card.id = $1;`,
            [data.id, user.uid, data]
        );
    }

    public async getUserCards(user: UserData): Promise<CardData[]> {
        return (await db.query(
            `SELECT
            cardData AS "cardData"
            FROM CCG.Card
            WHERE ownerID = $1;`,
            [user.uid]
        )).rows.map(result => result.cardData as CardData);
    }

    public async getUserSets(user: UserData): Promise<SetInformation[]> {
        return (await db.query(
            `SELECT id, setName as "name", setDescription as "description", public FROM CCG.Set
            WHERE ownerID = $1;`,
            [user.uid]
        )).rows;
    }

    public async insertOrUpdateSet(user: UserData, set: SetInformation) {
        if (!(await this.canModifySet(user, set.id))) {
            return false;
        }
        return db.query(
            `INSERT INTO CCG.Set(id, setName, setDescription, ownerID, public)
            VALUES($1, $2, $3, $4, $5)
            ON CONFLICT ON CONSTRAINT set_pkey
            DO UPDATE
                SET setName = $2,
                    setDescription = $3,
                    ownerID = $4,
                    public = $5
                WHERE Set.id = $1;`,
            [set.id, set.name, set.description, user.uid, set.public]
        );
    }

    public async getUserCardsInSet(user: UserData) {
        return (await db.query(
            `SELECT SM.setID AS "setId", SM.cardID AS "cardId"
            FROM CCG.Set as ST, CCG.SetMembership as SM
            WHERE SM.setID = ST.id
              AND ST.ownerID = $1;`,
            [user.uid]
        )).rows;
    }

    public async deleteSet(user: UserData, setId: any) {
        if (!(await this.canModifySet(user, setId))) {
            return false;
        }
        return db.query(`DELETE FROM CCG.set WHERE id = $1`, [setId]);
    }

    public async getPublicSets(): Promise<SetInformation[]> {
        return (await db.query(
            `SELECT id, setName as "name", setDescription as "description", username as "author"
            FROM CCG.Set, CCG.Account
            WHERE public = true
              AND ownerID = accountID;`
        )).rows;
    }

    public async getPublicSet(setId: string): Promise<CardSet | false> {
        const setInfoQuery = await db.query(
            `SELECT id, setName as "name", setDescription as "description" FROM CCG.Set
            WHERE public = true
              AND id = $1;`,
            [setId]
        );
        if (setInfoQuery.rowCount === 0) {
            return false;
        }
        const info = setInfoQuery.rows[0] as SetInformation;
        const cards = (await db.query(
            `SELECT CR.cardData as "cardData"
            FROM CCG.Card as CR, CCG.SetMembership as SM
            WHERE SM.setID = $1
              AND SM.cardID = CR.id;`,
            [setId]
        )).rows.map(result => result.cardData as CardData);
        return {
            id: info.id,
            name: info.name,
            description: info.description,
            public: info.public,
            cards: cards
        };
    }

    public async addCardToSet(user: UserData, cardId: string, setId: string) {
        if (
            !(await this.canModifyCard(user, cardId)) ||
            !(await this.canModifySet(user, setId))
        ) {
            return false;
        }
        return db.query(
            `INSERT INTO CCG.SetMembership (setID, cardID) VALUES ($1, $2)`,
            [setId, cardId]
        );
    }

    public async removeCardFromSet(user: UserData, cardId: any, setId: any) {
        if (
            !(await this.canModifyCard(user, cardId)) ||
            !(await this.canModifySet(user, setId))
        ) {
            return false;
        }
        return db.query(
            `DELETE FROM CCG.SetMembership
             WHERE setID = $1
               AND cardID = $2;`,
            [setId, cardId]
        );
    }

    private async canModifyCard(user: UserData, cardId: string) {
        const ownerQuery = await db.query(
            `SELECT ownerID as "ownerID" FROM CCG.Card
            WHERE id = $1;`,
            [cardId]
        );
        if (ownerQuery.rows.length === 0) {
            return true;
        }
        return ownerQuery.rows[0].ownerID === user.uid;
    }

    private async canModifySet(user: UserData, setId: string) {
        const ownerQuery = await db.query(
            `SELECT ownerID as "ownerID" FROM CCG.Set
            WHERE id = $1;`,
            [setId]
        );
        if (ownerQuery.rows.length === 0) {
            return true;
        }
        return ownerQuery.rows[0].ownerID === user.uid;
    }
}

export const moddingModel = new ModdingModel();
