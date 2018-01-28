import { Pool, Client } from 'pg';

export const db = new Pool();


  /*
    PGUSER=postgres \
    PGDATABASE=ccg \
    npm start
    */