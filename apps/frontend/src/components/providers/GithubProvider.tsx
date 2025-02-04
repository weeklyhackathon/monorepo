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
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");

    if (code && state) {
      handleGitHubCallback(code, state);
    } else {
      const token = localStorage.getItem("github_token");
      if (token) {
        fetchUserData(token);
      } else {
        setIsLoading(false);
      }
    }
  }, [location]);

  const handleGitHubCallback = async (code: string, state: string) => {
    try {
      setIsLoading(true);

      // Decode the state parameter to get our stored context
      const { authToken, secondAuthToken, fid } = JSON.parse(atob(state));

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

      if (data.access_token) {
        localStorage.setItem("github_token", data.access_token);
        await fetchUserData(data.access_token);
        navigate("/"); // Redirect to home page after successful login
      } else {
        throw new Error("Failed to get access token");
      }
    } catch (error) {
      console.error("Error during GitHub authentication:", error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("github_token");
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.removeItem("github_token");
      setUser(null);
    }
  };

  const login = () => {
    const queryParams = new URLSearchParams(location.search);
    const authToken = queryParams.get("authToken");
    const secondAuthToken = queryParams.get("secondAuthToken");
    const fid = queryParams.get("fid");

    // Store auth context in state parameter
    const state = btoa(
      JSON.stringify({
        authToken,
        secondAuthToken,
        fid,
      })
    );

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
