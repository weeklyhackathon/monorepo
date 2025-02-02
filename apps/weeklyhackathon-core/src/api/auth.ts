import Router from "koa-router";
import { env, log, POST, GET } from "@weeklyhackathon/utils";

export const authRouter = new Router({
  prefix: "/api/auth",
});

// GitHub OAuth callback
authRouter.post("/github/callback", async (ctx) => {
  try {
    log.info("🎯 GitHub callback initiated");
    const { code, fid } = ctx.request.body as { code: string; fid: number };
    log.info("📝 Received github code and FID:", {
      code: code?.slice(0, 8),
      fid,
    });

    if (!code) {
      log.info("❌ No code provided in request");
      ctx.status = 400;
      ctx.body = { error: "No code provided" };
      return;
    }

    // Exchange the code for an access token
    log.info("🔄 Exchanging code for access token...");
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
      log.info("❌ Failed to get access token from GitHub");
      ctx.status = 400;
      ctx.body = { error: "Failed to get access token" };
      return;
    }

    log.info("✅ Successfully received access token");

    // If we have an FID, store the connection
    if (fid) {
      log.info("🔗 Storing GitHub connection for FID:", fid);
      // TODO: Store the connection in the database
    }

    ctx.body = {
      access_token: tokenResponse.access_token,
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

// Check GitHub connection
authRouter.get("/github/check-connection", async (ctx) => {
  log.info("🔍 Checking GitHub connection");
  const fid = ctx.query.fid as string;

  if (!fid) {
    log.info("❌ No FID provided in request");
    ctx.status = 400;
    ctx.body = { error: "No FID provided" };
    return;
  }

  log.info("🔎 Looking up connection for FID:", fid);
  // TODO: Look up the connection in the database

  const connection = {
    github_token: "1234567890",
    connected_at: "2021-01-01T00:00:00Z",
  };

  // Verify the token is still valid
  try {
    log.info("🔄 Verifying GitHub token validity");
    await GET({
      url: "https://api.github.com/user",
      headers: {
        Authorization: `Bearer ${connection.github_token}`,
      },
    });

    log.info("✅ GitHub token is valid");
    ctx.body = {
      isConnected: true,
      github_token: connection.github_token,
    };
  } catch (error) {
    log.info("🗑️ Token invalid");
    ctx.body = { isConnected: false };
  }
});

// Get GitHub user data
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

    // TODO: Cross check this user response with the database

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
