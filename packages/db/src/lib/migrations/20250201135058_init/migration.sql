-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "path" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GithubUser" (
    "githubId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "GithubUser_pkey" PRIMARY KEY ("githubId")
);

-- CreateTable
CREATE TABLE "FarcasterUser" (
    "farcasterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "FarcasterUser_pkey" PRIMARY KEY ("farcasterId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_path_key" ON "User"("path");

-- CreateIndex
CREATE UNIQUE INDEX "GithubUser_userId_key" ON "GithubUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FarcasterUser_userId_key" ON "FarcasterUser"("userId");

-- AddForeignKey
ALTER TABLE "GithubUser" ADD CONSTRAINT "GithubUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarcasterUser" ADD CONSTRAINT "FarcasterUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
