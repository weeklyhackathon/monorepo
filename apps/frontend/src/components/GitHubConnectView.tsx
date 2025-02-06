import React, { useState, useEffect } from "react";
import { FrameContext } from "./providers/FarcasterProvider";
import { GithubUser } from "./providers/GithubProvider";
import { useInterval } from "../hooks/useInterval";

interface GitHubConnectViewProps {
  frameContext: FrameContext;
  authToken: string;
  onSuccess: (userData: { frameContext: { githubUser: GithubUser } }) => void;
  error: string | null;
  setError: (error: string) => void;
}

const GitHubConnectView: React.FC<GitHubConnectViewProps> = ({
  frameContext,
  authToken,
  onSuccess,
  error,
  setError,
}) => {
  const [isPolling, setIsPolling] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const POLLING_INTERVAL = 3000;

  useInterval(
    async () => {
      if (!isPolling || !frameContext?.user?.fid) return;

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_SERVER_URL
          }/api/auth/github/check-connection?fid=${frameContext.user.fid}`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": import.meta.env.VITE_API_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to check connection status");
        }

        const { isConnected } = await response.json();

        if (isConnected) {
          setIsPolling(false);
          setConnectionStatus("connected");

          // Fetch updated user data
          const userResponse = await fetch(
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
                fid: frameContext.user.fid,
              }),
            }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log("Got updated user data:", userData);
            // This will trigger App component re-render and show HackerDashboard
            onSuccess(userData);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    },
    isPolling ? POLLING_INTERVAL : null
  );

  const handleConnectClick = async () => {
    try {
      setConnectionStatus("connecting");
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/register-gh-login`,
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
        throw new Error(
          "Failed to register GitHub login. Please refresh and try again."
        );
      }

      const { secondAuthToken } = await response.json();

      // Start polling when opening the web view
      setIsPolling(true);

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
      setError(error instanceof Error ? error.message : "An error occurred");
      setConnectionStatus("error");
      setIsPolling(false);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => setIsPolling(false);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-black/95">
      <div className="text-[#2DFF05] flex flex-col items-center max-w-md p-8 border border-[#2DFF05]/20 rounded-lg bg-black/80 backdrop-blur-sm">
        <h2 className="text-3xl font-bold mb-6 tracking-wider">
          CONNECT GITHUB
        </h2>

        {connectionStatus === "connected" ? (
          <div className="text-center">
            <div className="mb-4 text-2xl">
              ✓ GitHub Connected Successfully!
            </div>
            <div className="text-lg text-gray-400">
              Loading your dashboard...
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={handleConnectClick}
              disabled={connectionStatus === "connecting"}
              className={`px-6 py-2 bg-[#2b2b2b] rounded-lg hover:bg-[#3b3b3b] transition-colors text-2xl ${
                connectionStatus === "connecting"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {connectionStatus === "connecting"
                ? "Connecting..."
                : "Connect GitHub Account"}
            </button>
            <small className="mt-4 text-lg w-2/3 mx-auto text-center text-gray-400">
              This will open a new tab on your browser for GitHub authentication
            </small>
          </>
        )}

        {error && <div className="mt-4 text-red-500 text-center">{error}</div>}

        {isPolling && (
          <div className="mt-4 text-sm text-gray-400 animate-pulse">
            Waiting for GitHub connection...
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubConnectView;
