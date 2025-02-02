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

console.log("GitHub OAuth credentials:", {
  GITHUB_CLIENT_ID,
  GITHUB_REDIRECT_URI,
});

export function GitHubProvider({ children }: { children: ReactNode }) {
  console.log("Rendering GitHubProvider");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("GitHubProvider useEffect running");
    // Check for auth code in URL
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    console.log("Auth code from URL:", code);

    if (code) {
      console.log("Found auth code, handling callback");
      handleGitHubCallback(code);
    } else {
      // Check if we have an existing token
      const token = localStorage.getItem("github_token");
      console.log(
        "Checking for existing token:",
        token ? "Found" : "Not found"
      );
      if (token) {
        fetchUserData(token);
      } else {
        setIsLoading(false);
      }
    }
  }, [location]);

  const handleGitHubCallback = async (code: string) => {
    console.log("Handling GitHub callback with code:", code);
    try {
      setIsLoading(true);
      // Exchange code for access token
      console.log("Making request to exchange code for token");
      const response = await fetch(`${API_URL}/api/auth/github/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      console.log(
        "Received token response:",
        data.access_token ? "Success" : "Failed"
      );

      if (data.access_token) {
        localStorage.setItem("github_token", data.access_token);
        console.log("Token stored in localStorage");
        await fetchUserData(data.access_token);
        console.log("Navigating to home page");
        navigate("/"); // Redirect to home page after successful login
      }
    } catch (error) {
      console.error("Error during GitHub authentication:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async (token: string) => {
    console.log("Fetching user data");
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("User data fetched successfully:", userData);
        setUser(userData);
      } else {
        console.log("Invalid token, clearing user data");
        // Token might be invalid
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
    console.log("Initiating GitHub login");
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=read:user`;
    console.log("Redirecting to GitHub auth URL:", githubAuthUrl);
    window.location.href = githubAuthUrl;
  };

  const logout = () => {
    console.log("Logging out user");
    localStorage.removeItem("github_token");
    setUser(null);
    navigate("/login");
  };

  console.log("Current GitHub context state:", {
    user,
    isAuthenticated: !!user,
    isLoading,
  });

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

// Custom hook to use GitHub context
export function useGitHub() {
  console.log("useGitHub hook called");
  const context = useContext(GitHubContext);
  if (context === undefined) {
    console.error("useGitHub must be used within a GitHubProvider");
    throw new Error("useGitHub must be used within a GitHubProvider");
  }
  return context;
}
