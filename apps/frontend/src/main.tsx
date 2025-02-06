import "./index.css";

import React, {
  useEffect,
  useState,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import sdk from "@farcaster/frame-sdk";
import FarcasterProvider from "./components/providers/FarcasterProvider";
import { FrameContext } from "./components/providers/FarcasterProvider";
import { Providers } from "./components/providers";

import App from "./App";
import { GithubUser } from "./components/providers/GithubProvider";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-screen bg-black text-white p-8 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
          <pre className="bg-gray-800 p-4 rounded mb-6 max-w-2xl overflow-auto">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function Root() {
  console.log("Rendering Root component");
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [frameContext, setFrameContext] = useState<FrameContext | undefined>(
    undefined
  );
  const [githubUser, setGithubUser] = useState<GithubUser | null>(null);

  useEffect(() => {
    const load = async () => {
      console.log("Loading SDK context...");
      const sdkFrameContext = await sdk.context;
      console.log("SDK Frame Context:", sdkFrameContext);

      if (sdkFrameContext.user.fid) {
        console.log("User FID found:", sdkFrameContext.user.fid);
        console.log("Making request to register frame opened...");

        const responseFromServer = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/auth/register-frame-opened`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": import.meta.env.VITE_API_KEY,
            },
            body: JSON.stringify({
              frameContext: sdkFrameContext,
            }),
          }
        );

        const data = await responseFromServer.json();
        console.log("RESPONSE FROM SERVER: ", data);
        console.log("Setting frame context and auth token...");
        setFrameContext(sdkFrameContext as FrameContext);
        setAuthToken(data.authToken);
        if (data.githubUser) {
          setGithubUser(data.githubUser);
        }
      } else {
        console.log("No user FID found in SDK context");
      }
      console.log("Calling sdk.actions.ready()");
      sdk.actions.ready();
    };

    if (sdk && !isSDKLoaded) {
      console.log("SDK available and not loaded, initializing...");
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <React.StrictMode>
      <Providers>
        <FarcasterProvider>
          <Routes>
            <Route
              path="/"
              element={
                <App
                  authToken={authToken}
                  frameContext={frameContext}
                  githubUser={githubUser}
                />
              }
            />
          </Routes>
        </FarcasterProvider>
      </Providers>
    </React.StrictMode>
  );
}

function AppWrapper() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

console.log("Mounting React application");
ReactDOM.createRoot(document.getElementById("root")!).render(<AppWrapper />);
