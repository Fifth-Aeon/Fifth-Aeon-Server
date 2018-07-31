import { Draft, SavedDraft } from "../game_model/draft";
import { db } from "../db";
import { UserData } from "./authentication.model";
import { getCollection, saveCollection, rewardPlayer } from "./cards";
import { Collection } from "../game_model/collection";


class DraftModel {

    /**
     * Creates a draft for a user if they already have enough gold and arn't already doing one.
     *
     * @param {UserData} user - The user who will be drafting
     * @returns - true if successful otherwise false
     * @memberof DraftModel
     */
    public async startDraft(user: UserData) {
        let collection = new Collection(await getCollection(user.uid));
        if (collection.getGold() < Draft.cost)
            return 'Not Enough Gold';
        if ((await this.getDraft(user)) !== false)
            return 'Already in draft';
        collection.removeGold(Draft.cost);
        const draft = new Draft();
        await db.query(`
            INSERT INTO CCG.Draft (accountID, draftData) 
            VALUES ($1, $2);
        `, [user.uid, draft]);
        await saveCollection(collection.getSavable(), user.uid);
        return draft.toSavable();
    }

    /**
     * Updates a draft when the user has amde a choice
     *
     * @param {UserData} user
     * @param {SavedDraft} draft
     * @returns A promise that completes when the operation is done
     * @memberof DraftModel
     */
    public updateDraft(user: UserData, draft: SavedDraft) {
        return db.query(`
            UPDATE CCG.Draft
            SET draftData = $2
            WHERE accountID = $1;
        `, [user.uid, draft]);
    }

    /**
     * Gets a users current draft or false if they don't have one
     *
     * @param {UserData} user
     * @returns - A draft object or false if the user isn't enrolled in a draft.
     * @memberof DraftModel
     */
    public async getDraft(user: UserData) {
        const result = await db.query(`
            SELECT draftData as "draftData" FROM CCG.Draft
            WHERE accountID = $1;
        `, [user.uid]);
        if (result.rowCount === 0)
            return false;
        return result.rows[0].draftData as SavedDraft;
    }

    public async endDraft(user: UserData, data: SavedDraft) {
        const draft = new Draft(data);
        let rewards = draft.getRewards();
        await rewardPlayer(user, rewards);
        await db.query(`
            DELETE FROM CCG.Draft
            WHERE accountID = $1;
        `, [user.uid]);
        return rewards
    }

}

export const draftModel = new DraftModel();