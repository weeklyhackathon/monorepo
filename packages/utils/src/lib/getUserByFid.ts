import { prisma } from '@weeklyhackathon/db';


export async function getUserByFid(fid: number) {
  const user = await prisma.user.findFirst({
    where: {
      farcasterUser: {
        farcasterId: fid
      }
    }
  });

  return user;
}
