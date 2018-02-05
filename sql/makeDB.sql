CREATE SCHEMA CCG;

CREATE TABLE CCG.Account (
    accountID           SERIAL PRIMARY KEY,
    username            VARCHAR(30) UNIQUE,
    email               VARCHAR(254) UNIQUE,
    emailVerified       BOOLEAN DEFAULT false,
    password            VARCHAR(256),
    salt                VARCHAR(32),
    skillLevel          SMALLINT DEFAULT 800,
    collection          JSON
);

CREATE TABLE CCG.Deck (
    deckID              SERIAL PRIMARY KEY,
    accountID           INTEGER,
    deckData            JSON,
    FOREIGN KEY (accountID) REFERENCES CCG.Account(accountID)
);
