DROP SCHEMA CCG CASCADE; 
CREATE SCHEMA CCG;

CREATE TABLE CCG.Account (
    accountID           SERIAL PRIMARY KEY,
    username            VARCHAR(30) UNIQUE,
    email               VARCHAR(254) UNIQUE,
    emailVerified       BOOLEAN DEFAULT false,
    skillLevel          INTEGER DEFAULT 800,
    password            VARCHAR(256),
    salt                VARCHAR(32)
);