import type { FrameContext } from '@weeklyhackathon/telegram/types';
import Router from 'koa-router';
import { prisma } from '@weeklyhackathon/db';
import { userPathFromFid,
  env,
  log,
  POST,
  GET,
  createAuthSession,
  validateAuthSession,
  createGithubAuthToken,
  validateGithubAuthToken,
  checkGithubConnection } from '@weeklyhackathon/utils';
import { getUserByFid } from '@weeklyhackathon/utils/getUserByFid';


export const authRouter = new Router({
  prefix: '/api/auth'
});

authRouter.get('/health', async (ctx) => {
  ctx.body = {
    status: 'ok'
  };
});

/**
 * First Contact Point: Frame Opening
 *
 * This endpoint is called when a user first opens the Farcaster frame.
 * It's the entry point of our auth flow and serves several purposes:
 * 1. Creates or retrieves the user based on their Farcaster ID (FID)
 * 2. Initializes an auth session for the GitHub connection flow
 * 3. Checks if the user already has a GitHub account connected
 *
 * Flow Context:
 * - User sees and opens the frame in their Farcaster client
 * - Frame loads and sends user's Farcaster context to this endpoint
 * - We create necessary database records and return auth token
 * - Frontend uses this token for subsequent GitHub connection flow
 */

authRouter.post('/register-frame-opened', async (ctx) => {
  const {
    frameContext
  } = ctx.request.body as { frameContext: FrameContext };
  log.info('📝 Received frame context:', frameContext);

  let user = await getUserByFid(frameContext.user.fid);

  try {
    // Create or update user in our database
    // If user exists, this just returns the existing user
    // If user is new, creates Farcaster user record
    user = user ?? await prisma.user.create({

      data: {
        path: userPathFromFid(frameContext.user.fid),
        displayName:
          frameContext.user.username ?? frameContext.user.fid.toString(),
        farcasterUser: {
          create: {
            farcasterId: frameContext.user.fid,
            username:
              frameContext.user.username ?? frameContext.user.fid.toString()
          }
        }
      },
      include: {
        githubUser: true
      }
    });
    log.info('IN HEREEEEE ', user);

    const githubUser = await prisma.githubUser.findFirst({
      where: {
        userId: user.id
      }
    });

    // Create auth session for potential GitHub connection
    // This generates a token that will be used to verify the user's
    // identity when they move from frame to web interface
    const {
      authToken
    } = await createAuthSession(frameContext);

    log.info(
      '🔑 Generated auth token and created session for fid: ',
      frameContext.user.fid
    );

    ctx.body = {
      authToken,
      hasGithub: !!githubUser,
      githubUser: githubUser
    };
  } catch (error) {
    log.error('💥 Error in register-frame-opened:', error);
    ctx.status = 500;
    ctx.body = {
      error: 'Failed to process frame registration'
    };
  }
});

/**
 * GitHub Connection Initiation
 *
 * This endpoint is called when user clicks "Connect GitHub" button.
 * It bridges the gap between frame authentication and GitHub OAuth flow.
 *
 * Flow Context:
 * - User has clicked "Connect GitHub" in the frame
 * - They're about to be redirected to web interface
 * - We need to generate a second token specifically for GitHub OAuth
 * - This second token will be used in the OAuth state parameter
 *
 * Security Context:
 * - Validates the original frame auth token
 * - Creates a short-lived token specifically for GitHub OAuth
 * - This prevents unauthorized GitHub connection attempts
 */
authRouter.post('/register-gh-login', async (ctx) => {
  const {
    frameContext, authToken
  } = ctx.request.body as {
    frameContext: FrameContext;
    authToken: string;
  };

  try {
    // Verify that this is a valid session from frame opening
    const validationResult = await validateAuthSession(authToken);
    if (!validationResult.isValid) {
      ctx.status = 401;
      ctx.body = {
        error: validationResult.error
      };
      return;
    }

    // Check if user already has GitHub connected
    const user = await prisma.user.findFirst({
      where: {
        farcasterUser: {
          farcasterId: frameContext.user.fid
        }
      },
      include: {
        githubUser: true
      }
    });

    const isGithubConnected = !!user?.githubUser;

    if (isGithubConnected) {
      ctx.body = {
        isGithubConnected: true
      };
      return;
    }

    // If not connected, create second token for GitHub flow
    const secondAuthToken = await createGithubAuthToken(authToken);
    if (!secondAuthToken) {
      ctx.status = 500;
      ctx.body = {
        error: 'Failed to create GitHub auth token'
      };
      return;
    }

    log.info('🔑 Generated GitHub auth token');

    ctx.body = {
      secondAuthToken,
      isGithubConnected: false
    };
  } catch (error) {
    log.error('💥 Error in register-gh-login:', error);
    ctx.status = 500;
    ctx.body = {
      error: 'Failed to process GitHub login registration'
    };
  }
});

authRouter.post('/get-farcaster-user-information', async (ctx) => {
  log.info('🔍 Getting Farcaster user information...');

  const {
    fid
  } = ctx.request.body as {
    fid: number;
  };

  // Get user and farcaster information
  const user = await prisma.user.findFirst({
    where: {
      farcasterUser: {
        farcasterId: fid
      }
    },
    include: {
      farcasterUser: true
    }
  });

  if (!user) {
    log.info('❌ User not found');
    ctx.status = 404;
    ctx.body = {
      error: 'User not found'
    };
    return;
  }

  log.info('✅ Found user information');

  // Construct frame context from stored user data
  const frameContext = {
    user: {
      fid: user.farcasterUser!.farcasterId,
      username: user.farcasterUser!.username,
      displayName: user.displayName
    }
  };

  ctx.body = {
    frameContext
  };

  log.info('📤 Returning frame context for FID:', fid);
});

/**
 * GitHub OAuth Callback Handler
 *
 * This endpoint handles the callback from GitHub's OAuth flow.
 * It's the final step in connecting a user's GitHub account.
 *
 * Flow Context:
 * - User has approved GitHub access on GitHub's website
 * - GitHub redirects back to our web interface
 * - We validate the session and connect the accounts
 *
 * Security Context:
 * - Validates the GitHub-specific auth token from state parameter
 * - Exchanges OAuth code for GitHub access token
 * - Creates permanent connection between Farcaster and GitHub accounts
 */
authRouter.post('/github/callback', async (ctx) => {
  try {
    log.info('Received GitHub callback');
    const {
      code, authToken, secondAuthToken, fid
    } = ctx.request.body as {
      code: string;
      authToken: string;
      secondAuthToken: string;
      fid: number;
    };

    log.info('Received GitHub callback with auth token:', authToken);

    // Verify this is a valid GitHub connection attempt
    const validation = await validateGithubAuthToken(secondAuthToken);
    log.info('GitHub auth validation result:', validation);

    if (!validation.isValid || !validation.session) {
      log.error('Invalid GitHub auth session');
      ctx.status = 401;
      ctx.body = {
        error: 'Invalid or expired session'
      };
      return;
    }

    log.info('Validated GitHub auth token, exchanging code for access token');

    // Exchange the OAuth code for a GitHub access token
    const tokenResponse = (await POST({
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        Accept: 'application/json'
      },
      body: {
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code
      }
    })) as { access_token?: string };

    log.info('GitHub token response:', tokenResponse);

    if (!tokenResponse || !tokenResponse.access_token) {
      log.error('Failed to get GitHub access token');
      throw new Error('Failed to get GitHub access token');
    }

    log.info('Got GitHub access token, fetching user profile');

    // Get the user's GitHub profile information
    const githubUser = (await GET({
      url: 'https://api.github.com/user',
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`
      }
    })) as { id?: number; login?: string };

    log.info('GitHub user profile:', githubUser);

    if (!githubUser || !githubUser.id || !githubUser.login) {
      log.error('Failed to fetch GitHub user profile');
      throw new Error('Failed to fetch GitHub user profile');
    }

    log.info('Connecting GitHub account to Farcaster user');

    const user = await prisma.user.findFirstOrThrow({
      where: {
        farcasterUser: {
          farcasterId: fid
        }
      }
    });

    // Connect GitHub account to user's Farcaster account
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        githubUser: {
          upsert: {
            create: {
              githubId: githubUser.id,
              username: githubUser.login,
              accessToken: tokenResponse.access_token
            },
            update: {
              username: githubUser.login,
              accessToken: tokenResponse.access_token
            }
          }
        }
      },
      include: {
        farcasterUser: true,
        githubUser: true
      }
    });

    log.info('Successfully connected GitHub account for user:', updatedUser);

    ctx.body = {
      access_token: tokenResponse.access_token,
      user: updatedUser
    };
  } catch (error) {
    log.error('💥 Error in GitHub callback:', error);
    ctx.status = 500;
    ctx.body = {
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

/**
 * GitHub Connection Status Check
 *
 * This endpoint checks if a user already has a GitHub account connected.
 * It's used both by the frame and web interface to determine what to show.
 *
 * Flow Context:
 * - Called when frame/web interface loads
 * - Helps determine whether to show "Connect GitHub" or "Already Connected"
 * - Also used to verify successful connection after OAuth flow
 */
authRouter.get('/github/check-connection', async (ctx) => {
  const fid = ctx.query.fid as string;
  if (!fid) {
    ctx.status = 400;
    ctx.body = {
      error: 'No FID provided'
    };
    return;
  }

  const isConnected = await checkGithubConnection(parseInt(fid));
  ctx.body = {
    isConnected
  };
});

/**
 * Fetch GitHub User Data
 *
 * This endpoint proxies requests to GitHub's API to fetch user data.
 * It's used after successful GitHub connection to display user information.
 *
 * Flow Context:
 * - Called after GitHub OAuth flow is complete
 * - Uses the GitHub access token stored during OAuth
 * - Provides GitHub profile information to the frontend
 *
 * Security Context:
 * - Requires GitHub access token in Authorization header
 * - Proxies request to GitHub API to maintain token security
 * - Handles errors from GitHub API gracefully
 */
authRouter.get('/github/user', async (ctx) => {
  try {
    log.info('👤 Fetching GitHub user data');
    const authHeader = ctx.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      log.info('❌ No authorization token provided');
      ctx.status = 401;
      ctx.body = {
        error: 'No token provided'
      };
      return;
    }

    const token = authHeader.split(' ')[1];
    log.info('🔑 Using token to fetch user data');

    const userResponse = await GET({
      url: 'https://api.github.com/user',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    log.info('✅ Successfully retrieved GitHub user data');
    ctx.body = userResponse;
  } catch (error) {
    log.error('💥 Error fetching GitHub user:', error);
    ctx.status = 500;
    ctx.body = {
      error: 'Failed to fetch user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});
