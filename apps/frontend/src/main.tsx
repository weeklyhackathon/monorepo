import './index.css';
import type { FrameContext } from './components/providers/FarcasterProvider';
import type { GithubUser } from './components/providers/GithubProvider';
import type { ErrorInfo,
  ReactNode } from 'react';
import sdk from '@farcaster/frame-sdk';
import React, { useEffect,
  useState,
  Component } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { Providers } from './components/providers';
import FarcasterProvider from './components/providers/FarcasterProvider';


class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
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
  console.log('Rendering Root component');
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [frameContext, setFrameContext] = useState<FrameContext | undefined>(
    undefined
  );
  const [githubUser, setGithubUser] = useState<GithubUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        console.log('Loading SDK context...');
        const sdkFrameContext = await sdk.context;
        console.log('SDK Frame Context:', sdkFrameContext);

        if (sdkFrameContext.user.fid) {
          console.log('User FID found:', sdkFrameContext.user.fid);
          console.log('Making request to register frame opened...');

          const responseFromServer = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/api/auth/register-frame-opened`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': import.meta.env.VITE_API_KEY
              },
              body: JSON.stringify({
                frameContext: sdkFrameContext
              })
            }
          );

          const data = await responseFromServer.json();
          console.log('RESPONSE FROM SERVER: ', data);
          console.log('Setting frame context and auth token...');
          setFrameContext(sdkFrameContext as FrameContext);
          setAuthToken(data.authToken);
          if (data.githubUser) {
            console.log('Setting github user...', data.githubUser);
            setGithubUser(data.githubUser);
          }
        } else {
          console.log('No user FID found in SDK context');
        }
      } catch (err) {
        console.error('Error in load function:', err);
        setError('An error occurred while loading the application');
      } finally {
        console.log('Calling sdk.actions.ready()');
        sdk.actions.ready();
      }
    };

    if (sdk && !isSDKLoaded) {
      console.log('SDK available and not loaded, initializing...');
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-[#2DFF05] text-center max-w-2xl p-8 border border-[#2DFF05] rounded-lg bg-black shadow-[0_0_30px_rgba(45,255,5,0.3)]">
          <h1 className="text-4xl font-bold mb-6 animate-pulse">
            Error Occurred
          </h1>
          <p className="text-xl mb-6">{error}</p>
          <p className="text-lg mb-4">
            Please contact{' '}
            <a
              href="https://warpcast.com/jpfraneto.eth"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#2DFF05]/80 transition-colors"
            >
              @jpfraneto.eth
            </a>{' '}
            to resolve this issue.
          </p>
        </div>
      </div>
    );
  }

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
                  setGithubUser={setGithubUser}
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

console.log('Mounting React application');
ReactDOM.createRoot(document.getElementById('root')!).render(<AppWrapper />);
