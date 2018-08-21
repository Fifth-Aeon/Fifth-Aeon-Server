import * as fs from 'fs';
import { Pool } from 'pg';
import { config } from './config';

export const db = new Pool({
  connectionString: config.connectionString
});


export async function startDB() {
  try {
    const existQuery = await db.query(`SELECT EXISTS (
    SELECT 1
    FROM   information_schema.tables 
    WHERE  table_schema = 'ccg'
    );`);
    if (!existQuery.rows[0].exists) {
      console.warn('No CCG Schema detected. Creating now.');
      fs.readFile('./sql/makeDB.sql', 'utf8', function (err, sql) {
        if (err) throw err;
        db.query(sql);
      });
    }
  } catch (e) {
    console.error('Could not connect to postgres database. Please be sure the server is running.');
    console.error('You may also need to set the PGUSER and PGDATABASE enviroment variables to the correct values.');
    console.error('See https://node-postgres.com/features/connecting')
    throw e;
  }
}
