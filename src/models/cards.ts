import { db } from '../db';
import { DeckList, SavedDeck } from '../game_model/deckList';
import { Collection, SavedCollection } from '../game_model/collection';
import { QueryResult } from 'pg';
import { getStarterDecks } from '../game_model/scenarios/decks';



export async function addCollection(ownerID: number) {

    let collection = new Collection();
    let decks: DeckList[] = [];
    let starters = getStarterDecks();
    for (let deck of starters) {
        decks.push(deck.clone());
        collection.addDeck(deck);
        await saveDeck(deck.getSavable(), ownerID);
    }
    await saveCollection(collection.getSavable(), ownerID);
}

export async function getCollection(ownerID: number) {
    let query = await db.query(` 
    SELECT collection
    FROM CCG.Account 
    WHERE accountID = $1`, [ownerID]);
    return query.rows[0].collection as SavedCollection;
}

export async function saveCollection(collectionData: SavedCollection, ownerID: number) {
    let collection = new Collection();
    collection.fromSavable(collectionData);
    return await db.query(`
        UPDATE CCG.Account 
        SET collection = $1
        WHERE accountID = $2;
    `, [collectionData, ownerID]);
}

export async function getDecks(ownerID: number) {
    const query = await db.query('SELECT deckID, deckData FROM CCG.Deck WHERE accountID = $1;', [ownerID]);
    return query.rows.map(row => {
        let deckdata = row.deckdata as SavedDeck
        deckdata.id = row.id;
        return deckdata;
    });
}

export async function saveDeck(deckData: SavedDeck, ownerID: number) {
    let deck = new DeckList();
    deck.fromSavable(deckData);
    let createQuery: QueryResult;

    if (deck.id === -1) {
        createQuery = await db.query(`
            INSERT INTO CCG.Deck (accountID, deckData) 
            VALUES ($1, $2)
            RETURNING (deckID);
            `, [ownerID, deckData]);
    } else {
        createQuery = await db.query(`
            UPDATE CCG.Deck 
            SET deckData = $2
            WHERE deckID = $1
            RETURNING (deckID);
            `, [deck.id, deckData]);
    }

    return createQuery.rows[0].deckid as number;
}


