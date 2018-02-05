CREATE SCHEMA CCG;

CREATE TABLE CCG.Account (
    accountID           SERIAL PRIMARY KEY,
    username            VARCHAR(30) UNIQUE,
    email               VARCHAR(254) UNIQUE,
    emailVerified       BOOLEAN DEFAULT false,
    skillLevel          SMALLINT DEFAULT 800,
    password            VARCHAR(256),
    salt                VARCHAR(32)
);

CREATE TABLE CCG.CollectionRecord (
    accountID           INTEGER,
    cardID              VARCHAR(30),
    repeats             SMALLINT,
    FOREIGN KEY (accountID) REFERENCES CCG.Account(accountID),
    Primary Key (accountID, cardID)
);

CREATE TABLE CCG.Deck (
    deckID              SERIAL PRIMARY KEY,
    accountID           INTEGER,
    name                VARCHAR(30),
    avatar              VARCHAR(30),
    shared              BOOLEAN DEFAULT false,
    FOREIGN KEY (accountID) REFERENCES CCG.Account(accountID)
);

CREATE TABLE CCG.DeckRecord (
    deckID              INTEGER,
    cardID              VARCHAR(30),
    repeats             SMALLINT,
    FOREIGN KEY (deckID) REFERENCES CCG.Deck(deckID),
    Primary Key (deckID, cardID)
);
