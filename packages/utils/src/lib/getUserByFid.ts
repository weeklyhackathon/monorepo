import { prisma } from '@weeklyhackathon/db';


export async function getUserByFid(fid: number | string) {
  const user = await prisma.user.findFirst({
    where: {
      farcasterUser: {
        farcasterId: Number(fid)
      }
    }
  });

  return user;
}


export async function getUserByFidOrThrow(fid: number | string) {
  const user = await getUserByFid(fid);

  if (!user) {
    throw new Error(`User with fid ${fid} not found`);
  }

  return user;
}
