// App.tsx
import type { FrameContext } from './components/providers/FarcasterProvider';
import type { GithubUser } from './components/providers/GithubProvider';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GitHubConnectView from './components/GitHubConnectView';
import HackerDashboard from './components/HackerDashboard';
import { useGitHub } from './components/providers/GithubProvider';

function App({
  authToken,
  frameContext,
  githubUser,
  setGithubUser
}: {
  authToken: string;
  frameContext: FrameContext | undefined;
  githubUser: GithubUser | null;
  setGithubUser: (githubUser: GithubUser | null) => void;
}) {
  const {
    user, isLoading, login
  } = useGitHub();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Handle GitHub OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      try {
        const decodedState = JSON.parse(atob(decodeURIComponent(state)));
        const {
          authToken, secondAuthToken, fid
        } = decodedState;

        navigate(
          `/?authToken=${authToken}&secondAuthToken=${secondAuthToken}&fid=${fid}`,
          {
            replace: true
          }
        );
      } catch (err) {
        console.error('Error processing OAuth callback:', err);
      }
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

  if (location.pathname === '/github/callback') {
    return (
      <div className="flex items-center justify-center h-screen bg-black/95">
        <div className="text-[#2DFF05] flex flex-col items-center p-8 border border-[#2DFF05]/20 rounded-lg bg-black/80 backdrop-blur-sm">
          <div className="text-2xl font-mono tracking-wider mb-4">
            <span className="animate-pulse">{'>'}</span> AUTHENTICATING
          </div>
          <div className="text-[#2DFF05]/80 font-mono">
            Establishing secure connection to GitHub...
          </div>
          <div className="mt-4 text-sm text-[#2DFF05]/60 animate-pulse">
            [==================] 100%
          </div>
        </div>
      </div>
    );
  }

  // Frame View - Show Connect Button
  if (frameContext?.user.fid) {
    console.log('IN HERE', githubUser, frameContext);
    if (githubUser && githubUser.username) {
      return (
        <HackerDashboard frameContext={frameContext} githubUser={githubUser} />
      );
    }

    return (
      <GitHubConnectView
        frameContext={frameContext}
        authToken={authToken}
        onSuccess={({
          frameContext: {
            githubUser
          }
        }) => {
          setGithubUser(githubUser);
        }}
        error={error}
        setError={setError}
      />
    );
  }

  // Web View - Show Farcaster Info and GitHub Connect Button
  const params = new URLSearchParams(location.search);
  const urlAuthToken = params.get('authToken');
  const urlSecondAuthToken = params.get('secondAuthToken');
  const urlFid = params.get('fid');

  if (urlAuthToken && urlSecondAuthToken && urlFid && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/95">
        <div className="text-[#2DFF05] flex flex-col items-center max-w-md p-8 border border-[#2DFF05]/20 rounded-lg bg-black/80 backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-6 tracking-wider">
            IDENTITY VERIFICATION
          </h2>

          <div className="bg-[#0a0a0a] p-6 rounded-lg mb-8 w-full border border-[#2DFF05]/10">
            <div className="text-lg text-[#2DFF05]/70 uppercase tracking-widest mb-2">
              Farcaster FID
            </div>
            <code className="font-mono text-xl">{urlFid}</code>
          </div>
          <p className="text-lg text-center mb-8 text-[#2DFF05]/80">
            Link your GitHub account to submit PRs through Farcaster frames.
            Each week, AI judges select the top 8 PRs to earn proportional
            shares of $hackathon trading fees.
          </p>

          <button
            onClick={login}
            className="w-full px-8 py-4 bg-[#2DFF05]/10 border border-[#2DFF05]/30 rounded-lg
                     hover:bg-[#2DFF05]/20 hover:border-[#2DFF05]/50 hover:shadow-[0_0_15px_rgba(45,255,5,0.2)]
                     transition-all duration-300 text-lg tracking-wide hover:cursor-pointer"
          >
            &gt; Initialize GitHub Auth_
          </button>
        </div>
      </div>
    );
  }

  // Web View - No Valid Params
  if (!frameContext && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-[#2DFF05] text-center max-w-2xl p-8 border border-[#2DFF05]/30 rounded-lg bg-[#0a0a0a] shadow-[0_0_15px_rgba(45,255,5,0.3)]">
          <h1 className="text-6xl font-bold mb-2 animate-pulse">$hackathon</h1>
          <div
            onClick={(event) => {
              navigator.clipboard.writeText(
                '0x3dF58A5737130FdC180D360dDd3EFBa34e5801cb'
              );
              const el = event.currentTarget as HTMLDivElement;
              el.classList.add('text-[#2DFF05]/50');
              el.textContent = 'Copied!';
              setTimeout(() => {
                el.classList.remove('text-[#2DFF05]/50');
                el.textContent = '0x3dF58A5737130FdC180D360dDd3EFBa34e5801cb';
              }, 1000);
            }}
            className="font-mek text-lg mb-8 cursor-pointer hover:text-[#2DFF05]/80 transition-colors"
          >
            0x3dF58A5737130FdC180D360dDd3EFBa34e5801cb
          </div>
          <div className="mb-8 text-xl leading-relaxed space-y-4">
            <p>Welcome to the decentralized future of hackathons.</p>
            <p>Submit your best PRs, compete weekly, earn rewards.</p>
            <p>Judged by AI. Paid by smart contracts. Pure meritocracy.</p>
            <p>
              All prizes come from $hackathon trading fees - a{' '}
              <a
                href="https://www.clanker.world/clanker/0x3dF58A5737130FdC180D360dDd3EFBa34e5801cb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2DFF05] hover:text-gray-200 transition-colors"
              >
                clanker
              </a>{' '}
              token.
            </p>
          </div>
          <div className="text-lg text-[#2DFF05]/50 mb-6">
            Access the full experience through{' '}
            <a
              href="https://warpcast.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2DFF05] hover:text-purple-500 transition-colors"
            >
              Warpcast
            </a>
          </div>
          <a
            href="https://warpcast.com/~/frames/launch?domain=hackathontoken.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-[#2DFF05]/10 border border-[#2DFF05] rounded-lg hover:bg-[#2DFF05]/20 hover:shadow-[0_0_20px_rgba(45,255,5,0.4)] transition-all duration-300"
          >
            &gt; Launch Frame_
          </a>
        </div>
      </div>
    );
  }

  // GitHub Authenticated View
  if (user) {
    return (
      <div className="flex flex-col items-center justify-start pt-20 px-4">
        <div className="text-center">
          <div className="relative border border-[#2DFF05]/20 p-3 rounded bg-black/40 p-4">
            {user.avatar_url && (
              <div className="relative mx-auto w-20 h-20 mb-4">
                <img
                  src={user.avatar_url}
                  alt={user.name || user.login}
                  className="w-20 h-20 rounded-full border-2 border-[#2DFF05] shadow-[0_0_15px_rgba(45,255,5,0.3)]"
                />
                <div className="absolute -inset-1 bg-[#2DFF05]/10 rounded-full blur-sm -z-10"></div>
              </div>
            )}
            <h1 className="text-2xl font-bold text-[#2DFF05] mb-2 tracking-wider font-mono">
              &lt;{user.name || user.login}&gt;_
            </h1>
            {user.login && (
              <p className="text-[#2DFF05]/60 mb-4 font-mono">@{user.login}</p>
            )}
            {user.bio && (
              <p className="text-[#2DFF05]/80 mb-4 max-w-md mx-auto font-mono ">
                {user.bio}
              </p>
            )}
          </div>
          <p className="text-gray-400 mb-2">Connected via GitHub</p>

          <p className="text-2xl font-bold text-[#2DFF05] mb-4 tracking-wider">
            Welcome to $HACKATHON
          </p>
          <p className="text-lg text-[#2DFF05]/80">
            You can now close this tab and{' '}
            <a
              href="https://warpcast.com/~/frames/launch?domain=weeklyhackathon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-300 transition-colors"
            >
              go back to the frame
            </a>
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
