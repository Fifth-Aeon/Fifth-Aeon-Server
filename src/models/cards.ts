import { db } from '../db';
import { DeckList, SavedDeck } from '../game_model/deckList';
import { Collection, SavedCollection } from '../game_model/collection';
import { QueryResult } from 'pg';

export async function saveCollection(collectionData: SavedCollection, ownerID: number) {
    let collection = new Collection();
    collection.fromSavable(collectionData);

}

export async function getCollection(ownerID: number) {

}



export async function saveDeck(deckData: SavedDeck, ownerID: number) {
    let deck = new DeckList();
    deck.fromSavable(deckData);
    let createQuery: QueryResult;
    if (deck.id === -1) {
        createQuery = await db.query(`
            INSERT INTO CCG.Deck (accountID, name, avatar) 
            VALUES ($1, $2, $3)
            RETURNING (deckID);
            `, [ownerID, deck.name, deck.avatar]);
    } else {
        createQuery = await db.query(`
            UPDATE CCG.Deck 
            SET name = $2, avatar = $3
            WHERE deckID = $1
            RETURNING (deckID);
            `, [deck.id, deck.name, deck.avatar]);
    }
    deck.id = createQuery.rows[0].deckid;

    await db.query('DELETE FROM CCG.DeckRecord WHERE deckID = $1;', [deck.id]);

    let cardInsertQuery = `
    INSERT INTO CCG.DeckRecord  (deckID, cardID, repeats)
    VALUES`;
    let values = [];
    const entries = deck.getEntries();

    for (let i = 0; i < entries.length; i++) {
        let entry = entries[i];
        cardInsertQuery += `\n ($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`;
        if (i !== entries.length - 1)
            cardInsertQuery += ',';
        values.push(deck.id, entry[0], entry[1]);
    }
    cardInsertQuery += ';';

    await db.query(cardInsertQuery, values);
}

export async function getDecks(ownerID: number) {
    const decksData = await db.query('SELECT deckID, accountID, name, avatar FROM CCG.Deck WHERE accountID = $1;', [ownerID]);
    const result: SavedDeck[] = []
    for (let deckData of decksData.rows) {
        let records = await db.query('SELECT cardID, repeats FROM CCG.DeckRecords WHERE deckID = $1;', [deckData.deckid]);
        result.push({
            records:  records.rows.map(row => [row.cardid, row.repeats] as [string, number]),
            name: deckData.name,
            avatar: deckData.avatar,
            customMetadata: true,
            id: deckData.deckid
        });
    }
    return result;
}

