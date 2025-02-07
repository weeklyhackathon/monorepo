import Router from "koa-router";
import { log } from "@weeklyhackathon/utils";
import { prisma } from "@weeklyhackathon/db";
import { savePullRequest } from "@weeklyhackathon/github";

export const uploadSubmissionsRouter = new Router({
  prefix: "/api/upload-submissions",
});

interface UploadSubmissionBody {
  fid: number;
  pullRequestUrl: string;
}

// GET pull requests for a user
uploadSubmissionsRouter.get("/:fid", async (ctx) => {
  const fid = parseInt(ctx.params.fid);

  if (!fid) {
    ctx.status = 400;
    ctx.body = { error: "Missing FID parameter" };
    return;
  }

  try {
    log.info("🔍 Looking up pull requests for FID:", fid);

    const user = await prisma.user.findFirst({
      where: {
        path: `fc_${fid}`,
      },
      include: {
        pullRequests: {
          include: {
            submitter: true,
          },
          orderBy: {
            submittedAt: "desc",
          },
        },
      },
    });

    if (!user) {
      ctx.status = 404;
      ctx.body = { error: "User not found" };
      return;
    }

    ctx.body = {
      success: true,
      pullRequests: user.pullRequests,
    };
  } catch (error) {
    log.error("💥 Error getting pull requests for FID:", fid);
    log.error(JSON.stringify({ error }, null, 2));

    ctx.status = 500;
    ctx.body = {
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// POST
uploadSubmissionsRouter.post("/", async (ctx) => {
  log.info("📥 Received submission upload request");

  const { fid, pullRequestUrl } = ctx.request.body as UploadSubmissionBody;
  log.info("Request details:", { fid, pullRequestUrl });

  if (!fid || !pullRequestUrl) {
    log.info("❌ Missing required fields");
    ctx.status = 400;
    ctx.body = { error: "Missing required fields" };
    return;
  }

  // Validate GitHub PR URL format
  const prUrlPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/;
  if (!prUrlPattern.test(pullRequestUrl)) {
    log.info("❌ Invalid PR URL format:", pullRequestUrl);
    ctx.status = 400;
    ctx.body = { error: "Invalid GitHub pull request URL format" };
    return;
  }

  try {
    log.info("🔍 Looking up user and GitHub connection for FID:", fid);

    // Check if user exists and has GitHub connected
    const user = await prisma.user.findFirst({
      where: {
        path: `fc_${fid}`,
        githubUser: {
          isNot: null,
        },
      },
      include: {
        githubUser: true,
      },
    });

    if (!user || !user.githubUser) {
      log.info("❌ User not found or GitHub not connected for FID:", fid);
      ctx.status = 400;
      ctx.body = { error: "User not found or GitHub not connected" };
      return;
    }

    log.info("✅ Found user with connected GitHub account");

    // Save pull request using the utility function
    log.info("💾 Saving pull request to database...");
    const pullRequest = await savePullRequest({
      url: pullRequestUrl,
      submitterId: user.id,
    });

    log.info("✅ Successfully saved pull request:", pullRequest);

    ctx.body = {
      success: true,
      pullRequest,
    };
  } catch (error) {
    log.error("💥 Error in POST /api/upload-submissions");
    log.error(
      JSON.stringify(
        {
          error,
          fid,
          pullRequestUrl,
        },
        null,
        2
      )
    );

    ctx.status = 500;
    ctx.body = {
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
});
