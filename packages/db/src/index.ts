

import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const prisma =
	((global as any).prisma as PrismaClient) ||
	new PrismaClient({
	  log: ['warn', 'error']
	});

if (process.env.NODE_ENV !== 'production' && global) {
  (global as any).prisma = prisma;
}
