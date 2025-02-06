import { prisma } from '@weeklyhackathon/db';
import { randomInt } from './random';


export async function generateUser() {
  const randomUserId = randomInt();

  const user = await prisma.user.create({
    data: {
      displayName: `Test User ${randomUserId}`,
      path: `test-user-${randomUserId}`
    }
  });

  return user;
}
