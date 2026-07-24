-- DropForeignKey
ALTER TABLE "PlaidItem" DROP CONSTRAINT IF EXISTS "PlaidItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "SetuConsent" DROP CONSTRAINT IF EXISTS "SetuConsent_userId_fkey";

-- DropTable
DROP TABLE IF EXISTS "PlaidItem";

-- DropTable
DROP TABLE IF EXISTS "SetuConsent";

-- DropIndex
DROP INDEX IF EXISTS "Income_plaidTransactionId_key";

-- DropIndex
DROP INDEX IF EXISTS "Expense_plaidTransactionId_key";

-- AlterTable
ALTER TABLE "Income" DROP COLUMN IF EXISTS "plaidTransactionId",
DROP COLUMN IF EXISTS "plaidAccountId",
DROP COLUMN IF EXISTS "dataSource";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN IF EXISTS "plaidTransactionId",
DROP COLUMN IF EXISTS "plaidAccountId",
DROP COLUMN IF EXISTS "dataSource";

-- DropEnum
DROP TYPE IF EXISTS "DataSource";
