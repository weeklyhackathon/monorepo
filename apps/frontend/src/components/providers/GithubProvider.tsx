import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
}

interface GitHubContextType {
  user: GitHubUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

export type GithubUser = {
  accessToken: string;
  createdAt: string;
  githubId: number;
  updatedAt: string;
  userId: string;
  username: string;
};

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_SERVER_URL;
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI;

export function GitHubProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("Starting GitHub auth effect");
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");
    console.log("URL params:", { code, state });

    if (code && state) {
      console.log("Found code and state, handling GitHub callback");
      handleGitHubCallback(code, state);
    } else {
      console.log("No code/state found, checking localStorage");
      const token = localStorage.getItem("github_token");
      if (token) {
        console.log("Found existing GitHub token, fetching user data");
        fetchUserGithubData(token);
      } else {
        console.log("No token found, setting loading to false");
        setIsLoading(false);
      }
    }
  }, [location]);

  const handleGitHubCallback = async (code: string, state: string) => {
    try {
      console.log("Starting GitHub callback handler with code:", code);
      setIsLoading(true);

      // Decode the state parameter to get our stored context
      const { authToken, secondAuthToken, fid } = JSON.parse(atob(state));
      console.log("Decoded state params:", { authToken, secondAuthToken, fid });

      console.log(
        "Making callback request to:",
        `${API_URL}/api/auth/github/callback`
      );
      const response = await fetch(`${API_URL}/api/auth/github/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_API_KEY,
        },
        body: JSON.stringify({
          code,
          authToken,
          secondAuthToken,
          fid,
        }),
      });

      const data = await response.json();
      console.log("Received response data:", data);

      if (data.access_token) {
        console.log("Successfully received access token");
        localStorage.setItem("github_token", data.access_token);
        await fetchUserGithubData(data.access_token);
        console.log("Redirecting to home page");
        navigate("/"); // Redirect to home page after successful login
      } else {
        console.log("No access token in response");
        throw new Error("Failed to get access token");
      }
    } catch (error) {
      console.error("Error during GitHub authentication:", error);
      // Handle error appropriately
    } finally {
      console.log("Finishing GitHub callback process");
      setIsLoading(false);
    }
  };

  const fetchUserGithubData = async (token: string) => {
    console.log("Starting GitHub user data fetch with token:", token);
    try {
      console.log("Making request to GitHub API");
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log("Successfully received GitHub user data");
        const userData = await response.json();
        console.log("Parsed user data:", userData);
        setUser(userData);
      } else {
        console.log("Failed to fetch user data, clearing token and user");
        localStorage.removeItem("github_token");
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      console.log("Clearing token and user due to error");
      localStorage.removeItem("github_token");
      setUser(null);
    } finally {
      console.log("GitHub user data fetch complete");
      setIsLoading(false);
    }
  };

  const login = () => {
    console.log("CALLING THE LOGIN FUNCTION");
    const queryParams = new URLSearchParams(location.search);
    const authToken = queryParams.get("authToken");
    const secondAuthToken = queryParams.get("secondAuthToken");
    const fid = queryParams.get("fid");
    console.log("THE AUTH TOKEN IS", authToken);
    console.log("THE SECOND AUTH TOKEN IS", secondAuthToken);
    console.log("THE FID IS", fid);

    // Store auth context in state parameter
    const state = btoa(
      JSON.stringify({
        authToken,
        secondAuthToken,
        fid,
      })
    );
    console.log("THE REDIRECT URL IS", GITHUB_REDIRECT_URI);

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=read:user&state=${state}`;
    window.location.href = githubAuthUrl;
  };

  const logout = () => {
    localStorage.removeItem("github_token");
    setUser(null);
    navigate("/");
  };

  return (
    <GitHubContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </GitHubContext.Provider>
  );
}

export function useGitHub() {
  const context = useContext(GitHubContext);
  if (context === undefined) {
    throw new Error("useGitHub must be used within a GitHubProvider");
  }
  return context;
}
