-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('WAITING_FOR_PAYMENT', 'PAID', 'SHIPPED', 'SUCCESSFULLY_DELIVERED', 'DISPUTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "sellerEmail" TEXT NOT NULL,
    "sellerBankAccount" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "subject" TEXT,
    "description" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'WAITING_FOR_PAYMENT',
    "trackingId" TEXT,
    "pinCodeBuyer" TEXT NOT NULL,
    "pinCodeSeller" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminComment" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminComment" ADD CONSTRAINT "AdminComment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
