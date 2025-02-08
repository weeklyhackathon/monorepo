import type { FarcasterUser, GithubUser, User } from '../../index';
import { validate } from 'uuid';
import { prisma } from '../../index';

// Quick test to make sure the db is working
describe('createUser', () => {
  it('should create a user', async () => {
    const userPath = `test-${Math.random().toString(36).substring(2, 15)}`;

    const farcasterId = Math.floor(Math.random() * 1000000000);
    const githubId = Math.floor(Math.random() * 1000000000);
    const accessToken = Math.random().toString(36).substring(2, 15);
    const user = await prisma.user.create({
      data: {
        path: userPath,
        displayName: 'test',
        farcasterUser: {
          create: {
            farcasterId,
            username: `testfc-${farcasterId}`
          }
        },
        githubUser: {
          create: {
            githubId,
            username: `testgh-${githubId}`,
            accessToken
          }
        }
      },
      include: {
        farcasterUser: true,
        githubUser: true
      }
    });

    const userId = user.id;

    expect(validate(userId)).toBe(true);

    expect(user).toMatchObject<
      User & { githubUser: GithubUser; farcasterUser: FarcasterUser }
    >({
      id: userId,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      path: userPath,
      displayName: 'test',
      farcasterUser: {
        farcasterId,
        username: `testfc-${farcasterId}`,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        userId: userId
      },
      githubUser: {
        githubId,
        username: `testgh-${githubId}`,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        userId: userId,
        accessToken
      }
    });
  });
});
