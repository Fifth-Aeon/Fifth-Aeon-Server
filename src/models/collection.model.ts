import { db } from 'db';
import { DeckList, SavedDeck } from 'game_model/deckList';
import { Collection, SavedCollection, Rewards } from 'game_model/collection';
import { QueryResult } from 'pg';
import { getStarterDecks } from 'game_model/scenarios/decks';
import { UserData } from './authentication.model';

class CollectionModel {
    private static dailyRewardTime = 1000 * 60 * 60 * 24;

    async checkDailyRewards(user: UserData) {
        let data = await db.query(`
            SELECT lastActive as "lastActive"
            FROM CCG.Account 
            WHERE accountID = $1;`,
            [user.uid]);
        let lastActive = data.rows[0].lastActive as Date;
        let elapsed = (Date.now() - lastActive.getTime());
        if (elapsed > CollectionModel.dailyRewardTime) {
            db.query(`
                UPDATE CCG.Account
                SET lastActive = CURRENT_TIMESTAMP
                WHERE accountID = $1;
            `, [user.uid]);
            let cardsAwareded = await this.rewardPlayer(user, {
                gold: 0,
                packs: 0,
                cards: 1
            });
            return cardsAwareded;
        }
        return CollectionModel.dailyRewardTime - elapsed;
    }

    async addCollection(ownerID: number, isGuest: boolean = false) {
        let collection = new Collection();
        let decks: DeckList[] = [];
        let starters = getStarterDecks();
        if (!isGuest)
            collection.addReward({ packs: 2, gold: 0 });

        for (let deck of starters) {
            decks.push(deck.clone());
            collection.addDeck(deck);
            await this.saveDeck(deck.getSavable(), ownerID);
        }
        await this.saveCollection(collection.getSavable(), ownerID);
    }

    async rewardPlayer(user: UserData, reward: Rewards) {
        let collection = new Collection(await this.getCollection(user.uid));
        let awareded = collection.addReward(reward);
        await this.saveCollection(collection.getSavable(), user.uid);
        return awareded;
    }

    async getCollection(ownerID: number) {
        let query = await db.query(` 
        SELECT collection
        FROM CCG.Account 
        WHERE accountID = $1`, [ownerID]);
        return query.rows[0].collection as SavedCollection;
    }

    async saveCollection(collectionData: SavedCollection, ownerID: number) {
        let collection = new Collection();
        collection.fromSavable(collectionData);
        return await db.query(`
            UPDATE CCG.Account 
            SET collection = $1
            WHERE accountID = $2;
        `, [collectionData, ownerID]);
    }

    async getDecks(ownerID: number) {
        const query = await db.query('SELECT deckID, deckData FROM CCG.Deck WHERE accountID = $1;', [ownerID]);
        return query.rows.map(row => {
            let deckdata = row.deckdata as SavedDeck
            deckdata.id = row.deckid;
            return deckdata;
        });
    }

    async deleteDeck(ownerID: number, deckID: number) {
        return await db.query(`
            DELETE FROM CCG.Deck
            WHERE accountID = $1
              and deckID    = $2;
        `, [ownerID, deckID]);
    }

    async saveDeck(deck: SavedDeck, ownerID: number) {
        let createQuery: QueryResult;
        if (deck.id === -1) {
            createQuery = await db.query(`
                INSERT INTO CCG.Deck (accountID, deckData) 
                VALUES ($1, $2)
                RETURNING (deckID);
                `, [ownerID, deck]);
        } else {
            createQuery = await db.query(`
                UPDATE CCG.Deck 
                SET deckData = $2
                WHERE deckID = $1
                RETURNING (deckID);
                `, [deck.id, deck]);
        }
        return createQuery.rows[0].deckid as number;
    }
}

export const collectionModel = new CollectionModel();
