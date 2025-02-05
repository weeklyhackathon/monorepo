// App.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GithubUser, useGitHub } from "./components/providers/GithubProvider";
import { FrameContext } from "./components/providers/FarcasterProvider";
import HackerDashboard from "./components/HackerDashboard";

function App({
  authToken,
  frameContext,
  githubUser,
}: {
  authToken: string;
  frameContext: FrameContext | undefined;
  githubUser: GithubUser | null;
}) {
  const { user, isLoading, login } = useGitHub();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Handle GitHub OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code) {
      navigate("/profile", { replace: true });
    }
  }, [location, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#2DFF05]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Frame View - Show Connect Button
  if (frameContext?.user.fid) {
    if (githubUser && githubUser.username) {
      return (
        <HackerDashboard frameContext={frameContext} githubUser={githubUser} />
      );
    }

    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#2DFF05] flex flex-col items-center">
          <h2 className="text-2xl mb-4">$HACKATHON</h2>
          <button
            onClick={async () => {
              try {
                const response = await fetch(
                  `${
                    import.meta.env.VITE_SERVER_URL
                  }/api/auth/register-gh-login`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-api-key": import.meta.env.VITE_API_KEY,
                    },
                    body: JSON.stringify({
                      frameContext,
                      authToken,
                    }),
                  }
                );

                if (!response.ok)
                  throw new Error("Failed to register GitHub login");

                const { secondAuthToken } = await response.json();

                // Open web view with auth parameters
                window.open(
                  `${
                    import.meta.env.VITE_BASE_URL
                  }?authToken=${authToken}&secondAuthToken=${secondAuthToken}&fid=${
                    frameContext.user.fid
                  }`,
                  "_blank"
                );
              } catch (error) {
                setError(
                  error instanceof Error ? error.message : "Unknown error"
                );
              }
            }}
            className="px-6 py-2 bg-[#2b2b2b] rounded-lg hover:bg-[#3b3b3b] transition-colors"
          >
            Connect GitHub Account
          </button>
          <small className="mt-4 text-xs text-gray-400">
            This will open a new tab for GitHub authentication
          </small>
        </div>
      </div>
    );
  }

  // Web View - Show Farcaster Info and GitHub Connect Button
  const params = new URLSearchParams(location.search);
  const urlAuthToken = params.get("authToken");
  const urlSecondAuthToken = params.get("secondAuthToken");
  const urlFid = params.get("fid");

  if (urlAuthToken && urlSecondAuthToken && urlFid && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#2DFF05] flex flex-col items-center">
          <h2 className="text-2xl mb-6">Connect Your GitHub Account</h2>

          {/* Show Farcaster info first */}
          <div className="bg-[#1a1a1a] p-6 rounded-lg mb-8 text-center">
            <h3 className="text-lg mb-4">Your Farcaster Account</h3>
            <p className="text-gray-400">FID: {urlFid}</p>
          </div>

          {/* GitHub connect button */}
          <button
            onClick={login}
            className="px-6 py-3 bg-[#2b2b2b] rounded-lg hover:bg-[#3b3b3b] transition-colors"
          >
            Connect GitHub Account
          </button>
        </div>
      </div>
    );
  }

  // Web View - No Valid Params
  if (!frameContext && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#2DFF05] text-center">
          <h2 className="text-2xl mb-4">Please start from Farcaster Frame</h2>
          <p className="text-sm text-gray-400">
            This page should be accessed through a Farcaster frame
          </p>
        </div>
      </div>
    );
  }

  // GitHub Authenticated View
  if (user) {
    return (
      <div className="flex flex-col items-center justify-start pt-20 px-4">
        <div className="text-center">
          <p className="text-gray-400 mb-2">Connected via GitHub</p>
          {user.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.name || user.login}
              className="w-20 h-20 rounded-full border-2 border-[#2DFF05] mx-auto mb-4"
            />
          )}
          <h1 className="text-2xl font-bold text-[#2DFF05] mb-2">
            {user.name || user.login}
          </h1>
          {user.login && <p className="text-gray-400 mb-4">@{user.login}</p>}
          {user.bio && (
            <p className="text-gray-300 mb-4 max-w-md mx-auto">{user.bio}</p>
          )}
          <a
            href="https://warpcast.com/~/frames/launch?domain=weeklyhackathon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-[#2b2b2b] rounded-lg hover:bg-[#3b3b3b] transition-colors"
          >
            back to frame
          </a>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
