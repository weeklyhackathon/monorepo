import Router from "koa-router";
import { env, log, POST, GET } from "@weeklyhackathon/utils";
import { prisma } from "@weeklyhackathon/db";
import { FrameContext } from "@weeklyhackathon/telegram/types";

export const authRouter = new Router({
  prefix: "/api/auth",
});

authRouter.get("/health", async (ctx) => {
  ctx.body = {
    status: "ok",
  };
});

authRouter.post("/register-frame-opened", async (ctx) => {
  const { frameContext } = ctx.request.body as { frameContext: FrameContext };
  log.info("📝 Received frame context:", frameContext);

  // Generate a random token
  const authToken =
    Math.random().toString(36).substring(2) + Date.now().toString(36);

  // Create user if doesn't exist
  const user = await prisma.user.upsert({
    where: { path: `fc_${frameContext.user.fid}` },
    create: {
      path: `fc_${frameContext.user.fid}`,
      displayName: frameContext.user.username,
      farcasterUser: {
        create: {
          farcasterId: frameContext.user.fid,
          username: frameContext.user.username,
        },
      },
    },
    update: {},
  });

  log.info("🔑 Generated auth token:", authToken);
  log.info("💾 Stored frame context for later use");

  ctx.body = {
    authToken,
  };
});

authRouter.post("/register-gh-login", async (ctx) => {
  const { frameContext, authToken } = ctx.request.body as {
    frameContext: FrameContext;
    authToken: string;
  };

  // Verify user exists
  const user = await prisma.user.findFirst({
    where: {
      path: `fc_${frameContext.user.fid}`,
      farcasterUser: {
        farcasterId: frameContext.user.fid,
      },
    },
  });

  if (!user) {
    ctx.status = 401;
    ctx.body = { error: "Invalid user or frame context mismatch" };
    return;
  }

  log.info("✅ Verified user and frame context match");

  // Generate second auth token for GitHub flow
  const secondAuthToken =
    Math.random().toString(36).substring(2) + Date.now().toString(36);

  log.info("🔑 Generated second auth token:", secondAuthToken);

  ctx.body = {
    secondAuthToken,
  };
});

authRouter.post("/get-farcaster-user-information", async (ctx) => {
  log.info("🔍 Getting Farcaster user information...");

  const { fid } = ctx.request.body as {
    fid: number;
  };

  // Get user and farcaster information
  const user = await prisma.user.findFirst({
    where: {
      path: `fc_${fid}`,
      farcasterUser: {
        farcasterId: fid,
      },
    },
    include: {
      farcasterUser: true,
    },
  });

  if (!user) {
    log.info("❌ User not found");
    ctx.status = 404;
    ctx.body = { error: "User not found" };
    return;
  }

  log.info("✅ Found user information");

  // Construct frame context from stored user data
  const frameContext = {
    user: {
      fid: user.farcasterUser!.farcasterId,
      username: user.farcasterUser!.username,
      displayName: user.displayName,
    },
  };

  ctx.body = {
    frameContext,
  };

  log.info("📤 Returning frame context for FID:", fid);
});

authRouter.post("/github/callback", async (ctx) => {
  try {
    const { code, state } = ctx.request.body as {
      code: string;
      state: string;
    };

    // Decode the state parameter to get our tokens
    const { fid } = JSON.parse(atob(state));

    // Verify the user exists
    const user = await prisma.user.findFirst({
      where: {
        path: `fc_${fid}`,
        farcasterUser: {
          farcasterId: fid,
        },
      },
    });

    if (!user) {
      ctx.status = 401;
      ctx.body = { error: "Invalid user" };
      return;
    }

    // Exchange code for access token
    const tokenResponse = (await POST({
      url: "https://github.com/login/oauth/access_token",
      headers: {
        Accept: "application/json",
      },
      body: {
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code,
      },
    })) as { access_token: string };

    if (!tokenResponse.access_token) {
      throw new Error("Failed to get access token");
    }

    // Get GitHub user data
    const githubUser = await GET({
      url: "https://api.github.com/user",
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`,
      },
    });

    // Update user with GitHub information
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        githubUser: {
          upsert: {
            create: {
              githubId: githubUser.id,
              username: githubUser.login,
            },
            update: {
              username: githubUser.login,
            },
          },
        },
      },
      include: {
        farcasterUser: true,
        githubUser: true,
      },
    });

    ctx.body = {
      access_token: tokenResponse.access_token,
      user: updatedUser,
    };
  } catch (error) {
    log.error("💥 Error in GitHub callback:", error);
    ctx.status = 500;
    ctx.body = {
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

authRouter.get("/github/check-connection", async (ctx) => {
  log.info("🔍 Checking GitHub connection");
  const fid = ctx.query.fid as string;

  if (!fid) {
    log.info("❌ No FID provided in request");
    ctx.status = 400;
    ctx.body = { error: "No FID provided" };
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      path: `fc_${fid}`,
      farcasterUser: {
        farcasterId: parseInt(fid),
      },
    },
    include: {
      githubUser: true,
    },
  });

  if (!user?.githubUser) {
    ctx.body = { isConnected: false };
    return;
  }

  ctx.body = {
    isConnected: true,
  };
});

authRouter.get("/github/user", async (ctx) => {
  try {
    log.info("👤 Fetching GitHub user data");
    const authHeader = ctx.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      log.info("❌ No authorization token provided");
      ctx.status = 401;
      ctx.body = { error: "No token provided" };
      return;
    }

    const token = authHeader.split(" ")[1];
    log.info("🔑 Using token to fetch user data");

    const userResponse = await GET({
      url: "https://api.github.com/user",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    log.info("✅ Successfully retrieved GitHub user data");
    ctx.body = userResponse;
  } catch (error) {
    log.error("💥 Error fetching GitHub user:", error);
    ctx.status = 500;
    ctx.body = {
      error: "Failed to fetch user data",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
});
