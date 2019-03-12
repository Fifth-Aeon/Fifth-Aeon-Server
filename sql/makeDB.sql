CREATE SCHEMA CCG;

CREATE TYPE CCG.USER_ROLE AS ENUM ('guest', 'user', 'mod', 'admin');

CREATE TABLE CCG.Account (
    accountID           SERIAL PRIMARY KEY,
    username            VARCHAR(30) NOT NULL CHECK(username SIMILAR TO '[a-zA-Z0-9]+( [a-zA-Z0-9]+)*'),
    email               VARCHAR(254),
    emailVerified       BOOLEAN DEFAULT false NOT NULL,
    banned              BOOLEAN DEFAULT false NOT NULL,
    joined              DATE DEFAULT CURRENT_DATE NOT NULL,
    lastActive          TIMESTAMP DEFAULT CURRENT_DATE NOT NULL,
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

-- Draft Storage
CREATE TABLE CCG.Draft (
    accountID INTEGER NOT NULL,
    draftData JSON NOT NULL,
    FOREIGN KEY (accountID) REFERENCES CCG.Account(accountID)
);

-- A.I Tournament definitons
CREATE TABLE CCG.AITournament (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(30),
    active       BOOLEAN
);

CREATE TABLE CCG.TournamentTeam (
    id           SERIAL PRIMARY KEY,
    tournamentID INTEGER,
    teamName     VARCHAR(30) NOT NULL CHECK(teamName SIMILAR TO '[a-zA-Z0-9]+( [a-zA-Z0-9]+)*'),
    joinCode     TEXT NOT NULL DEFAULT md5(random()::text),
    FOREIGN KEY (tournamentID) REFERENCES CCG.AITournament(id)
);
CREATE UNIQUE INDEX unique_team_name ON CCG.TournamentTeam (LOWER(teamName));

CREATE TABLE CCG.TeamSubmission (
    id           SERIAL PRIMARY KEY,
    owningTeam   INTEGER NOT NULL,
    submitted    TIMESTAMP NOT NULL DEFAULT CURRENT_DATE,
    contents     BYTEA,
    FOREIGN KEY (owningTeam) REFERENCES CCG.TournamentTeam(id)
);

CREATE TABLE CCG.TournamentParticipant (
    accountID    INTEGER NOT NULL,
    teamID       INTEGER,
    tournamentID INTEGER NOT NULL,
    isTeamOwner  BOOLEAN,
    FOREIGN KEY (teamId) REFERENCES CCG.TournamentTeam(id),
    FOREIGN KEY (accountID) REFERENCES CCG.Account(accountID),
    FOREIGN KEY (tournamentID) REFERENCES CCG.AITournament(id),
    PRIMARY KEY (accountID, tournamentID)
);
