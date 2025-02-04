import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGitHub } from "./components/providers/GithubProvider";
import "./App.css";
import {
  FrameContext,
  useFarcaster,
} from "./components/providers/FarcasterProvider";

function App({ authToken }: { authToken: string }) {
  const { user, isLoading, isAuthenticated, login, logout } = useGitHub();
  const location = useLocation();
  const navigate = useNavigate();
  const [githubUser, setGithubUser] = useState(user);
  const [frameContextOutsideFrame, setFrameContextOutsideFrame] =
    useState<FrameContext | null>(null);
  const { frameContext } = useFarcaster();

  // Effect to handle initial load and auth flow
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const fid = queryParams.get("fid");
    const authToken = queryParams.get("authToken");
    const secondAuthToken = queryParams.get("secondAuthToken");

    if (code) {
      // Let the GitHub provider handle the OAuth callback
      navigate("/profile", { replace: true });
      return;
    }

    if (authToken && secondAuthToken && fid) {
      fetchFarcasterUser(authToken, secondAuthToken, fid);
    }
  }, [location, navigate]);

  const fetchFarcasterUser = async (
    authToken: string,
    secondAuthToken: string,
    fid: string
  ) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL
        }/api/auth/get-farcaster-user-information`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_API_KEY,
          },
          body: JSON.stringify({
            fid,
            authToken,
            secondAuthToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Farcaster user");
      }

      const data = await response.json();
      setFrameContextOutsideFrame(data.frameContext);
    } catch (error) {
      console.error("Error fetching Farcaster user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#2DFF05]">Loading...</div>
      </div>
    );
  }

  // Handle Frame Context UI
  if (frameContext?.user.fid) {
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

                if (!response.ok) {
                  throw new Error("Failed to register GitHub login");
                }

                const data = await response.json();
                window.location.href = `${
                  import.meta.env.VITE_BASE_URL
                }?authToken=${authToken}&secondAuthToken=${
                  data.secondAuthToken
                }&fid=${frameContext?.user.fid}`;
              } catch (error) {
                console.error("Error registering GitHub login:", error);
              }
            }}
            className="px-6 py-2 bg-[#2b2b2b] rounded-lg hover:bg-[#3b3b3b] transition-colors"
          >
            Login with GitHub
          </button>
          <small className="mt-4 text-xs text-gray-400">
            this will open a new tab, where you need to login with your github
            account
          </small>
        </div>
      </div>
    );
  }

  // Handle GitHub auth UI
  if (!isAuthenticated && !githubUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#2DFF05] flex flex-col items-center">
          <h2 className="text-2xl mb-4">$HACKATHON</h2>
          <button
            onClick={login}
            className="px-6 py-2 bg-[#2b2b2b] rounded-lg hover:bg-[#3b3b3b] transition-colors"
          >
            Login with GitHub
          </button>
          {frameContextOutsideFrame?.user?.fid && (
            <div className="p-4 mt-4 rounded-lg border flex flex-col items-center">
              <p>you are coming from a farcaster frame</p>
              <p>username: @{frameContextOutsideFrame.user.username}</p>
              <p>fid: {frameContextOutsideFrame.user.fid}</p>
              <div className="flex items-center justify-center h-16 w-16 rounded-full overflow-hidden">
                <img
                  src={frameContextOutsideFrame.user.pfpUrl}
                  alt={frameContextOutsideFrame.user.username}
                  className="h-full w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User profile view
  const displayUser = githubUser || user;
  return (
    <div className="flex flex-col items-center justify-start pt-20 px-4">
      <div className="text-center">
        <p className="text-gray-400 mb-2">connected via github:</p>
        <div className="flex items-center justify-center mb-4">
          {displayUser?.avatar_url && (
            <img
              src={displayUser.avatar_url}
              alt={displayUser.name || displayUser.login}
              className="w-20 h-20 rounded-full border-2 border-[#2DFF05]"
            />
          )}
        </div>
        <h1 className="text-2xl font-bold text-[#2DFF05] mb-2">
          {displayUser?.name || displayUser?.login}
        </h1>
        {displayUser?.login && (
          <p className="text-gray-400 mb-4">@{displayUser.login}</p>
        )}
        {displayUser?.bio && (
          <p className="text-gray-300 mb-4 max-w-md mx-auto">
            {displayUser.bio}
          </p>
        )}
        <button
          onClick={() => {
            logout();
            setGithubUser(null);
          }}
          className="px-6 py-2 bg-[#2b2b2b] rounded-lg hover:bg-[#3b3b3b] transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
