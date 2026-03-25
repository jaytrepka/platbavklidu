-- Add author columns to AdminComment table
ALTER TABLE "AdminComment" ADD COLUMN "author" TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE "AdminComment" ADD COLUMN "authorRole" TEXT NOT NULL DEFAULT 'ADMIN';
