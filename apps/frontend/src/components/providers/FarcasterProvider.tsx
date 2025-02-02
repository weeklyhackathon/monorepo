import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import sdk from "@farcaster/frame-sdk";

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

interface FrameContext {
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
  vote: string;
  setVote: (vote: string) => void;
  weekOneFinalists: Hacker[];
}

export interface Hacker {
  username: string;
  fid: number;
  pfp_url: string;
  display_name: string;
  project_url: string;
  github_url: string;
  demo_url: string;
  id: number;
  draggablePosition: number;
}

const initialVote = Array.from({ length: 8 }, (_, i) => i + 1)
  .sort(() => Math.random() - 0.5)
  .join("");

const weekOneFinalists: Hacker[] = [
  {
    username: "jvaleska.eth",
    fid: 13505,
    pfp_url:
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/f82ddc2b-1c48-4e8f-61b3-e40eb4d59700/original",
    display_name: "J. Valeska 🦊🎩🫂 ",
    project_url: "https://farcaster-frames-v2-demo.vercel.app",
    github_url: "https://github.com/jvaleskadevs/farcaster-frames-v2-demo",
    demo_url: "https://www.youtube.com/shorts/n6TVlqgExRo",
    id: 1,
    draggablePosition: Number(initialVote[0]),
  },
  {
    username: "hellno.eth",
    fid: 13596,
    pfp_url: "https://i.imgur.com/qoHFjQD.gif",
    display_name: "hellno the optimist",
    project_url: "https://farcasterframeception.vercel.app",
    github_url: "https://github.com/hellno/frameception",
    demo_url: "https://vimeo.com/1047553467/af29b86b8e?share=copy",
    id: 2,
    draggablePosition: Number(initialVote[1]),
  },
  {
    username: "cashlessman.eth",
    fid: 268438,
    pfp_url:
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/a74b030e-2d92-405c-c2d0-1696f5d51d00/original",
    display_name: "cashlessman 🎩",
    project_url: "https://hackathon-bay-seven.vercel.app",
    github_url: "https://github.com/cashlessman/HACKATHON",
    demo_url: "https://youtube.com/shorts/6L9oX98xFmk",
    id: 3,
    draggablePosition: Number(initialVote[2]),
  },
  {
    username: "shomari.eth",
    fid: 870594,
    pfp_url:
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/57f8600f-2e51-4549-8cc4-f80e4c681800/rectcrop3",
    display_name: "Shomari",
    project_url: "https://frameify.xyz",
    github_url: "https://github.com/castrguru/frameify",
    demo_url: "https://youtube.com/shorts/_ZWLzTZ0DGs",
    id: 4,
    draggablePosition: Number(initialVote[3]),
  },
  {
    username: "breck",
    fid: 158,
    pfp_url:
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/bebf2f70-37fa-4114-9720-3bdc32f72a00/original",
    display_name: "Breck Yunits",
    project_url: "https://framehub.pro",
    github_url: "https://github.com/breck7/week-1",
    demo_url: "https://www.youtube.com/watch?v=3T6jUOJLWTw",
    id: 5,
    draggablePosition: Number(initialVote[4]),
  },
  {
    username: "dalresin",
    fid: 422333,
    pfp_url: "https://i.imgur.com/Gtrkty9.jpg",
    display_name: "Lord Dalresin🐝",
    project_url: "https://builder.dbee.be",
    github_url: "https://github.com/ysalitrynskyi/week-1",
    demo_url: "https://www.youtube.com/watch?v=7aRn3yEszIU",
    id: 6,
    draggablePosition: Number(initialVote[5]),
  },
  {
    username: "boredhead",
    fid: 6861,
    pfp_url: "https://i.imgur.com/P7utvMt.jpg",
    display_name: "kt 🤠",
    project_url: "https://next-frame-psi.vercel.app",
    github_url: "https://github.com/kirtirajsinh/framexperiment",
    demo_url: "https://youtu.be/bZfYeDcB2N8",
    id: 7,
    draggablePosition: Number(initialVote[6]),
  },
  {
    username: "itsmide.eth",
    fid: 262800,
    pfp_url: "https://i.imgur.com/96rdcWp.jpg",
    display_name: "mide (aka fraye)",
    project_url: "https://frames-v2.builders.garden",
    github_url: "https://github.com/builders-garden/frames-v2-showcase",
    demo_url: "https://www.youtube.com/watch?v=TXDSIAL1q_s",
    id: 8,
    draggablePosition: Number(initialVote[7]),
  },
];

// Randomly shuffle the finalists array
const shuffledFinalists = [...weekOneFinalists]
  .sort(() => Math.random() - 0.5)
  .map((finalist, index) => ({
    ...finalist,
    draggablePosition: index + 1, // Update draggablePosition based on new random order
  }));

// Replace weekOneFinalists with shuffled version
weekOneFinalists.splice(0, weekOneFinalists.length, ...shuffledFinalists);

const FarcasterContext = createContext<FarcasterContextType>({
  fid: null,
  isConnected: false,
  isLoading: true,
  error: null,
  frameContext: null,
  openUrl: async () => {},
  isFarcasterFrame: true,
  vote: initialVote,
  setVote: () => {},
  weekOneFinalists: weekOneFinalists,
});

export const useFarcaster = () => {
  const context = useContext(FarcasterContext);
  if (!context) {
    throw new Error("useFarcaster must be used within a FarcasterProvider");
  }
  return context;
};

interface FarcasterProviderProps {
  children: ReactNode;
}

export default function FarcasterProvider({
  children,
}: FarcasterProviderProps) {
  const [fid, setFid] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [frameContext, setFrameContext] = useState<FrameContext | null>(null);
  const [isFarcasterFrame, setIsFarcasterFrame] = useState(true);
  const [vote, setVote] = useState(initialVote);

  useEffect(() => {
    const initializeFarcaster = async () => {
      console.log("Starting Farcaster initialization...");
      try {
        // Initialize SDK
        console.log("Initializing SDK...");
        sdk.actions.ready();
        console.log("SDK initialized successfully");

        // Get frame context
        console.log("Fetching frame context...");
        const context = (await sdk.context) as FrameContext;
        console.log("Received frame context:", context);
        setFrameContext(context);

        if (context?.user?.fid) {
          console.log("Found user FID:", context.user.fid);
          setFid(context.user.fid);
          setIsConnected(true);
          console.log("User connected successfully");
        } else {
          console.log("No FID found, setting as non-Farcaster frame");
          setIsFarcasterFrame(false);
        }
      } catch (err) {
        console.error("Error initializing Farcaster:", err);
        setError("Failed to initialize Farcaster connection");
        console.log("Initialization failed with error:", err);
      } finally {
        console.log("Initialization complete, setting loading to false");
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
        window.open(url, "_blank");
      }
    } catch (error) {
      window.open(url, "_blank");
    }
  };

  const value = {
    fid,
    isConnected,
    isLoading,
    error,
    frameContext,
    openUrl,
    isFarcasterFrame,
    vote,
    setVote,
    weekOneFinalists,
  };

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  );
}
