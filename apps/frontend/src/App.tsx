import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGitHub } from "./components/providers/GithubProvider";
import "./App.css";
import { useFarcaster } from "./components/providers/FarcasterProvider";
import sdk from "@farcaster/frame-sdk";

function App() {
  const { user, isLoading, isAuthenticated, login, logout } = useGitHub();
  const location = useLocation();
  const navigate = useNavigate();
  const [githubUser, setGithubUser] = useState(user);
  const { frameContext } = useFarcaster();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");

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

  if (frameContext?.user.fid) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#2DFF05] flex flex-col items-center">
          <button
            onClick={() => {
              sdk.actions.openUrl(import.meta.env.VITE_BASE_URL);
            }}
            className="px-6 py-2 bg-[#2b2b2b] rounded-lg hover:bg-[#3b3b3b] transition-colors"
          >
            Login with GitHub
          </button>
          <small className="mt-4 text-xs text-gray-400">
            this will open a new tab
          </small>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !githubUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#2DFF05]">
          <button
            onClick={login}
            className="px-6 py-2 bg-[#2b2b2b] rounded-lg hover:bg-[#3b3b3b] transition-colors"
          >
            Login with GitHub
          </button>
        </div>
      </div>
    );
  }

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
