-- Keep legacy FREE/PREMIUM rows readable while adding the current MEMBER tier.
ALTER TYPE "UserTier" ADD VALUE IF NOT EXISTS 'MEMBER';

ALTER TABLE "users" ALTER COLUMN "tier" SET DEFAULT 'MEMBER';
