import { randomInt } from '@weeklyhackathon/testing';
import { saveRepo } from '../saveRepo';

describe('saveRepo', () => {

  it('should save a new repo when given a URL', async () => {
    const randomNumber = randomInt();

    const result = await saveRepo({
      url: `https://github.com/owner${randomNumber}/repo${randomNumber}`
    });

    expect(result).toMatchObject({
      owner: `owner${randomNumber}`,
      name: `repo${randomNumber}`,
      nameWithOwner: `owner${randomNumber}/repo${randomNumber}`
    });
  });

  it('should save a new repo when given owner and name', async () => {
    const randomNumber = randomInt();

    const result = await saveRepo({
      owner: `owner${randomNumber}`,
      name: `repo${randomNumber}`
    });

    expect(result).toMatchObject({
      owner: `owner${randomNumber}`,
      name: `repo${randomNumber}`,
      nameWithOwner: `owner${randomNumber}/repo${randomNumber}`
    });
  });

  it('should update an existing repo', async () => {
    const randomNumber = randomInt();

    // First create
    await saveRepo({
      owner: `owner${randomNumber}`,
      name: `repo${randomNumber}`
    });

    // Then update with analysis
    const analysis = {
      summary: 'Test summary',
      productDescription: 'Test product description',
      technicalArchitecture: 'Test technical architecture'
    };

    const result = await saveRepo({
      owner: `owner${randomNumber}`,
      name: `repo${randomNumber}`,
      analysis
    });

    expect(result).toMatchObject({
      ...analysis,
      owner: `owner${randomNumber}`,
      name: `repo${randomNumber}`,
      nameWithOwner: `owner${randomNumber}/repo${randomNumber}`
    });
    expect(result.reviewedAt).toBeInstanceOf(Date);
  });

  it('should throw error when neither URL nor owner/name provided', async () => {
    await expect(saveRepo({})).rejects.toThrow('Must provide either URL or owner/name pair');
  });
});
