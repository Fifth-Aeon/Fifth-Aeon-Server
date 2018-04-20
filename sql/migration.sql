-- Migrations for Guest Accounts --------------------------------------------------

-- Add Guest Account role
ALTER TYPE CCG.USER_ROLE ADD VALUE 'guest' BEFORE 'user';

-- Remove Email Not Null constraint (guests have null emails)
ALTER TABLE CCG.Account ALTER COLUMN email DROP NOT NULL;

-- End Migrations for Guest Accounts ----------------------------------------------
