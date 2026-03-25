/*
  Warnings:

  - You are about to drop the column `pinCodeBuyer` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `pinCodeSeller` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accessTokenBuyer]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessTokenSeller]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessTokenBuyer` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessTokenSeller` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CreatedBy" AS ENUM ('BUYER', 'SELLER');

-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE IF NOT EXISTS 'WAITING_FOR_APPROVAL';
ALTER TYPE "TransactionStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';
ALTER TYPE "TransactionStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

-- AlterTable: add new columns as nullable first
ALTER TABLE "Transaction" DROP COLUMN "pinCodeBuyer",
DROP COLUMN "pinCodeSeller",
ADD COLUMN     "accessTokenBuyer" TEXT,
ADD COLUMN     "accessTokenSeller" TEXT,
ADD COLUMN     "createdBy" "CreatedBy",
ALTER COLUMN "sellerBankAccount" DROP NOT NULL;

-- Backfill existing rows
UPDATE "Transaction" SET
  "accessTokenBuyer" = gen_random_uuid()::text || '-' || gen_random_uuid()::text,
  "accessTokenSeller" = gen_random_uuid()::text || '-' || gen_random_uuid()::text,
  "createdBy" = 'BUYER'
WHERE "accessTokenBuyer" IS NULL;

-- Now make columns NOT NULL
ALTER TABLE "Transaction" ALTER COLUMN "accessTokenBuyer" SET NOT NULL;
ALTER TABLE "Transaction" ALTER COLUMN "accessTokenSeller" SET NOT NULL;
ALTER TABLE "Transaction" ALTER COLUMN "createdBy" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_accessTokenBuyer_key" ON "Transaction"("accessTokenBuyer");
CREATE UNIQUE INDEX "Transaction_accessTokenSeller_key" ON "Transaction"("accessTokenSeller");
