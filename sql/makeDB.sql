CREATE SCHEMA CCG;

CREATE TYPE CCG.USER_ROLE AS ENUM ('user', 'mod', 'admin');

CREATE TABLE CCG.Account (
    accountID           SERIAL PRIMARY KEY,
    username            VARCHAR(30) NOT NULL CHECK(username SIMILAR TO '[a-zA-Z0-9]+( [a-zA-Z0-9]+)*'),
    email               VARCHAR(254) NOT NULL,
    emailVerified       BOOLEAN DEFAULT false NOT NULL,
    banned              BOOLEAN DEFAULT false NOT NULL,
    joined              DATE DEFAULT CURRENT_DATE NOT NULL,
    skillLevel          SMALLINT DEFAULT 800,
    collection          JSON,
    password            VARCHAR(256) NOT NULL CHECK (LENGTH(password) >= 8),
    salt                VARCHAR(32) NOT NULL,
    role                CCG.USER_ROLE DEFAULT 'user' NOT NULL
);

-- Case insensative unique constraints
CREATE UNIQUE INDEX unique_username ON CCG.Account (LOWER(username));
CREATE UNIQUE INDEX unique_email    ON CCG.Account (LOWER(email));

CREATE TABLE CCG.Deck (
    deckID              SERIAL PRIMARY KEY,
    accountID           INTEGER,
    deckData            JSON,
    FOREIGN KEY (accountID) REFERENCES CCG.Account(accountID)
);
