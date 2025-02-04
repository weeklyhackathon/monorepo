/*
  Warnings:

  - Added the required column `accessToken` to the `GithubUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GithubUser" ADD COLUMN     "accessToken" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "authToken" TEXT NOT NULL,
    "secondAuthToken" TEXT NOT NULL,
    "fid" INTEGER NOT NULL,
    "frameContext" JSONB NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_authToken_key" ON "AuthSession"("authToken");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_secondAuthToken_key" ON "AuthSession"("secondAuthToken");
