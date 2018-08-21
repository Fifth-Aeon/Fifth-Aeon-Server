-- Migrations for Guest Accounts --------------------------------------------------

-- Add Guest Account role
ALTER TYPE CCG.USER_ROLE ADD VALUE 'guest' BEFORE 'user';

-- Remove Email Not Null constraint (guests have null emails)
ALTER TABLE CCG.Account ALTER COLUMN email DROP NOT NULL;

-- End Migrations for Guest Accounts ----------------------------------------------

-- Add Simple Draft Data 
CREATE TABLE CCG.Draft (
    accountID INTEGER NOT NULL,
    draftData JSON NOT NULL,
    FOREIGN KEY (accountID) REFERENCES CCG.Account(accountID)
);

-- Add last login time
ALTER TABLE CCG.Account ADD COLUMN lastActive TIMESTAMP DEFAULT joined NOT NULL;
