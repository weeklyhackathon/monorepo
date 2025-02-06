import type { GithubPullRequest } from '@prisma/client';
import { generateUser, randomInt } from '@weeklyhackathon/testing';
import { savePullRequest } from '../savePullRequest';

describe('savePullRequest', () => {


  it('should save a new pull request when given a URL', async () => {

    const randomNumber = randomInt();

    const user = await generateUser();

    const result = await savePullRequest({
      url: `https://github.com/owner${randomNumber}/repo${randomNumber}/pull/123`,
      submitterId: user.id
    });

    expect(result).toMatchObject<GithubPullRequest>({
      githubRepoNameWithOwner: `owner${randomNumber}/repo${randomNumber}`,
      number: 123,
      submittedBy: user.id,
      analysedAt: null,
      productAnalysis: null,
      technicalArchitecture: null,
      id: expect.any(String),
      updatedAt: expect.any(Date),
      submittedAt: expect.any(Date)
    });
  });

  it('should save a new pull request when given owner, repo and number', async () => {
    const user = await generateUser();

    const randomNumber = randomInt();

    const result = await savePullRequest({
      owner: `owner${randomNumber}`,
      name: `repo${randomNumber}`,
      prNumber: 123,
      submitterId: user.id
    });

    expect(result).toMatchObject<GithubPullRequest>({
      githubRepoNameWithOwner: `owner${randomNumber}/repo${randomNumber}`,
      number: 123,
      submittedBy: user.id,
      analysedAt: null,
      productAnalysis: null,
      technicalArchitecture: null,
      id: expect.any(String),
      updatedAt: expect.any(Date),
      submittedAt: expect.any(Date)
    });
  });

  it('should update an existing pull request', async () => {
    const randomNumber = randomInt();

    const user = await generateUser();

    // First create
    await savePullRequest({
      owner: `owner${randomNumber}`,
      name: `repo${randomNumber}`,
      prNumber: 123,
      submitterId: user.id
    });

    // Then update with analysis
    const analysis = {
      productAnalysis: 'Test summary',
      technicalArchitecture: 'Test architecture'
    };

    const result = await savePullRequest({
      owner: `owner${randomNumber}`,
      name: `repo${randomNumber}`,
      prNumber: 123,
      submitterId: user.id,
      analysis
    });

    expect(result).toMatchObject<GithubPullRequest>({
      productAnalysis: analysis.productAnalysis,
      technicalArchitecture: analysis.technicalArchitecture,
      githubRepoNameWithOwner: `owner${randomNumber}/repo${randomNumber}`,
      number: 123,
      submittedBy: user.id,
      analysedAt: expect.any(Date),
      id: expect.any(String),
      updatedAt: expect.any(Date),
      submittedAt: expect.any(Date)
    });
    expect(result.analysedAt).toBeInstanceOf(Date);
  });

  it('should throw error when neither URL nor owner/repo/number provided', async () => {
    await expect(savePullRequest({} as any)).rejects.toThrow('Must provide either URL or owner/name/PR');
  });
});
