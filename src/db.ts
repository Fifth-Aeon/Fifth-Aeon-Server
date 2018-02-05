import { Pool, Client } from 'pg';
import * as fs from 'fs';
import { DeckList } from './game_model/deckList';
import { saveDeck } from './models/cards';
export const db = new Pool();

async function startup() {
  const existQuery = await db.query(`SELECT EXISTS (
    SELECT 1
    FROM   information_schema.tables 
    WHERE  table_schema = 'ccg'
    );`);
    if (!existQuery.rows[0].exists) {
      console.warn('No CCG Schema detected. Creating now.');
      fs.readFile('./sql/makeDB.sql', 'utf8', function(err, sql) {
        if (err) throw err;
        db.query(sql);
      });
    }
}

startup();
