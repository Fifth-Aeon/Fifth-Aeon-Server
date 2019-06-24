import { Draft, SavedDraft } from "../game_model/draft";
import { db } from "../db";
import { UserData } from "./authentication.model";
import { collectionModel } from "./collection.model";
import { Collection } from "../game_model/collection";

class DraftModel {
    /**
     * Creates a draft for a user if they already have enough gold and aren't already doing one.
     *
     * @param user - The user who will be drafting
     * @returns - true if successful otherwise false
     */
    public async startDraft(user: UserData) {
        const collection = new Collection(
            await collectionModel.getCollection(user.uid)
        );
        if (collection.getGold() < Draft.cost) { return "Not Enough Gold"; }
        if ((await this.getDraft(user)) !== false) { return "Already in draft"; }
        collection.removeGold(Draft.cost);
        const draft = new Draft();
        await db.query(
            `
            INSERT INTO CCG.Draft (accountID, draftData)
            VALUES ($1, $2);
        `,
            [user.uid, draft]
        );
        await collectionModel.saveCollection(collection.getSavable(), user.uid);
        return draft.toSavable();
    }

    /**
     * Updates a draft when the user has made a choice
     *
     * @returns A promise that completes when the operation is done
     */
    public updateDraft(user: UserData, draft: SavedDraft) {
        return db.query(
            `
            UPDATE CCG.Draft
            SET draftData = $2
            WHERE accountID = $1;
        `,
            [user.uid, draft]
        );
    }

    /**
     * Gets a users current draft or false if they don't have one
     *
     * @returns - A draft object or false if the user isn't enrolled in a draft.
     */
    public async getDraft(user: UserData) {
        const result = await db.query(
            `
            SELECT draftData as "draftData" FROM CCG.Draft
            WHERE accountID = $1;
        `,
            [user.uid]
        );
        if (result.rowCount === 0) { return false; }
        return result.rows[0].draftData as SavedDraft;
    }

    public async endDraft(user: UserData, data: SavedDraft) {
        const draft = new Draft(data);
        const rewards = draft.getRewards();
        await collectionModel.rewardPlayer(user, rewards);
        await db.query(
            `
            DELETE FROM CCG.Draft
            WHERE accountID = $1;
        `,
            [user.uid]
        );
        return rewards;
    }
}

export const draftModel = new DraftModel();
