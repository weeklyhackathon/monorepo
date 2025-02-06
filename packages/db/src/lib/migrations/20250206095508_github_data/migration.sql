-- CreateTable
CREATE TABLE "GithubRepo" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "nameWithOwner" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "summary" TEXT,
    "productDescription" TEXT,
    "technicalArchitecture" TEXT
);

-- CreateTable
CREATE TABLE "GithubPullRequest" (
    "id" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "analysedAt" TIMESTAMP(3),
    "productAnalysis" TEXT,
    "technicalArchitecture" TEXT,
    "githubRepoNameWithOwner" TEXT NOT NULL,

    CONSTRAINT "GithubPullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GithubRepo_nameWithOwner_key" ON "GithubRepo"("nameWithOwner");

-- CreateIndex
CREATE UNIQUE INDEX "GithubRepo_owner_name_key" ON "GithubRepo"("owner", "name");

-- CreateIndex
CREATE UNIQUE INDEX "GithubPullRequest_githubRepoNameWithOwner_number_key" ON "GithubPullRequest"("githubRepoNameWithOwner", "number");

-- AddForeignKey
ALTER TABLE "GithubPullRequest" ADD CONSTRAINT "GithubPullRequest_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GithubPullRequest" ADD CONSTRAINT "GithubPullRequest_githubRepoNameWithOwner_fkey" FOREIGN KEY ("githubRepoNameWithOwner") REFERENCES "GithubRepo"("nameWithOwner") ON DELETE RESTRICT ON UPDATE CASCADE;
