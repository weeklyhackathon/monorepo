
import type { GithubUser, User } from '../../index';
import { validate } from 'uuid';
import { prisma } from '../../index';

// Quick test to make sure the db is working
describe('createUser', () => {
  it('should create a user', async () => {

    const user = await prisma.user.create({
      data: {
        name: 'test',
        farcasterId: 1234567890,
        githubUser: {
          create: {
            githubId: 111777,
            username: 'test'
          }
        }
      },
      include: {
        githubUser: true
      }
    });

    const userId = user.id;

    expect(validate(userId)).toBe(true);


    expect(user).toMatchObject<User & { githubUser: GithubUser }>({
      id: userId,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      name: 'test',
      farcasterId: 1234567890,
      githubUser: {
        githubId: 111777,
        username: 'test',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        userId: userId
      }
    });
  });
});
