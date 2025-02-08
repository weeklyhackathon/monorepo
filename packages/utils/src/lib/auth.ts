import type { FrameContext } from '@weeklyhackathon/telegram/types';
import crypto from 'crypto';
import { prisma } from '@weeklyhackathon/db';
import { log } from './log';

export type AuthSessionInfo = {
  frameContext: FrameContext;
  authToken: string;
  secondAuthToken?: string;
};

export type ValidateAuthResult = {
  isValid: boolean;
  session?: AuthSessionInfo;
  error?: string;
};

const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in ms
const GITHUB_TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes in ms

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createAuthSession(
  frameContext: FrameContext
): Promise<AuthSessionInfo> {
  try {
    const authToken = generateToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY);

    // Create session in database
    await prisma.authSession.create({
      data: {
        authToken,
        secondAuthToken: generateToken(),
        fid: frameContext.user.fid,
        frameContext: frameContext as any,
        expiresAt
      }
    });

    log.info(`Created auth session for FID: ${frameContext.user.fid}`);

    return {
      frameContext,
      authToken
    };
  } catch (error) {
    log.error('Failed to create auth session:', error);
    throw new Error('Failed to create authentication session');
  }
}

export async function validateAuthSession(
  authToken: string
): Promise<ValidateAuthResult> {
  try {
    const session = await prisma.authSession.findUnique({
      where: {
        authToken
      }
    });

    if (!session) {
      return {
        isValid: false,
        error: 'Session not found'
      };
    }

    if (session.expiresAt < new Date()) {
      return {
        isValid: false,
        error: 'Session expired'
      };
    }

    return {
      isValid: true,
      session: {
        frameContext: session.frameContext as FrameContext,
        authToken: session.authToken,
        secondAuthToken: session.secondAuthToken
      }
    };
  } catch (error) {
    log.error('Error validating auth session:', error);
    return {
      isValid: false,
      error: 'Error validating session'
    };
  }
}

export async function createGithubAuthToken(
  authToken: string
): Promise<string | null> {
  try {
    const validation = await validateAuthSession(authToken);
    if (!validation.isValid) {
      return null;
    }

    const secondAuthToken = generateToken();
    const expiresAt = new Date(Date.now() + GITHUB_TOKEN_EXPIRY);

    // Update the session with the new GitHub auth token
    await prisma.authSession.update({
      where: {
        authToken
      },
      data: {
        secondAuthToken,
        expiresAt // Extend session expiry for GitHub flow
      }
    });

    return secondAuthToken;
  } catch (error) {
    log.error('Error creating GitHub auth token:', error);
    return null;
  }
}

export async function validateGithubAuthToken(
  secondAuthToken: string
): Promise<ValidateAuthResult> {
  try {
    const session = await prisma.authSession.findUnique({
      where: {
        secondAuthToken
      }
    });

    if (!session) {
      return {
        isValid: false,
        error: 'GitHub auth session not found'
      };
    }

    if (session.expiresAt < new Date()) {
      return {
        isValid: false,
        error: 'GitHub auth session expired'
      };
    }

    return {
      isValid: true,
      session: {
        frameContext: session.frameContext as FrameContext,
        authToken: session.authToken,
        secondAuthToken: session.secondAuthToken
      }
    };
  } catch (error) {
    log.error('Error validating GitHub auth token:', error);
    return {
      isValid: false,
      error: 'Error validating GitHub session'
    };
  }
}

export async function getFarcasterUser(fid: number) {

  if (!fid) {
    throw new Error('FID is required');
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        farcasterUser: {
          farcasterId: fid
        }
      },
      include: {
        farcasterUser: true,
        githubUser: true
      }
    });

    return user;
  } catch (error) {
    log.error('Error fetching Farcaster user:', error);
    return null;
  }
}

export async function checkGithubConnection(fid: number): Promise<boolean> {
  try {
    const user = await getFarcasterUser(fid);
    return !!user?.githubUser;
  } catch (error) {
    log.error('Error checking GitHub connection:', error);
    return false;
  }
}
