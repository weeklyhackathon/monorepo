import type { ReactNode } from 'react';
import sdk from '@farcaster/frame-sdk';
import { createContext,
  useContext,
  useState,
  useEffect } from 'react';

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface FrameNotificationDetails {
  notificationId: string;
  notificationType: string;
}

interface FrameLocationContext {
  pathname: string;
  href: string;
}

export interface FrameContext {
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  location?: FrameLocationContext;
  client: {
    clientFid: number;
    added: boolean;
    safeAreaInsets?: SafeAreaInsets;
    notificationDetails?: FrameNotificationDetails;
  };
}

interface FarcasterContextType {
  fid: number | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  frameContext: FrameContext | null;
  openUrl: (url: string) => Promise<void>;
  isFarcasterFrame: boolean;
}

const FarcasterContext = createContext<FarcasterContextType>({
  fid: null,
  isConnected: false,
  isLoading: true,
  error: null,
  frameContext: null,
  openUrl: async () => {},
  isFarcasterFrame: true
});

export const useFarcaster = () => {
  const context = useContext(FarcasterContext);
  if (!context) {
    throw new Error('useFarcaster must be used within a FarcasterProvider');
  }
  return context;
};

interface FarcasterProviderProps {
  children: ReactNode;
}

export default function FarcasterProvider({
  children
}: FarcasterProviderProps) {
  const [fid, setFid] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [frameContext, setFrameContext] = useState<FrameContext | null>(null);
  const [isFarcasterFrame, setIsFarcasterFrame] = useState(true);

  useEffect(() => {
    const initializeFarcaster = async () => {
      console.log('Starting Farcaster initialization...');
      try {
        // Get frame context
        console.log('Fetching frame context...');
        const context = (await sdk.context) as FrameContext;
        console.log('Received frame context:', context);
        setFrameContext(context);

        if (context?.user?.fid) {
          console.log('Found user FID:', context.user.fid);
          setFid(context.user.fid);
          setIsConnected(true);
          console.log('User connected successfully');
        } else {
          console.log('No FID found, setting as non-Farcaster frame');
          setIsFarcasterFrame(false);
        }
      } catch (err) {
        console.error('Error initializing Farcaster:', err);
        setError('Failed to initialize Farcaster connection');
        console.log('Initialization failed with error:', err);
      } finally {
        console.log('Initialization complete, setting loading to false');
        setIsLoading(false);
      }
    };

    initializeFarcaster();
  }, []);

  const openUrl = async (url: string) => {
    try {
      const context = await sdk.context;
      if (context?.user?.fid) {
        await sdk.actions.openUrl(url);
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  const value = {
    fid,
    isConnected,
    isLoading,
    error,
    frameContext,
    openUrl,
    isFarcasterFrame
  };

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  );
}
