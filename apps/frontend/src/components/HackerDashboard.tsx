import { useEffect, useState } from "react";
import { HackerDashboardProps, PullRequest } from "../types";
import { LuScrollText } from "react-icons/lu";
import { MdOutlineEdit } from "react-icons/md";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const HackerDashboard = ({
  githubUser,
  frameContext,
}: HackerDashboardProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [prUrl, setPrUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [prHistory, setPrHistory] = useState<PullRequest[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentCyclePR, setCurrentCyclePR] = useState<PullRequest | null>(
    null
  );
  const [editCurrentCyclePR, setEditCurrentCyclePR] = useState(false);

  useEffect(() => {
    const fetchPRHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/upload-submissions/${
            frameContext.user.fid
          }`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": import.meta.env.VITE_API_KEY,
            },
          }
        );

        const data = await response.json();
        console.log("THE DATA OF THE PR HISTORY", data);
        if (response.ok) {
          setPrHistory(data.pullRequests);

          // Find PR for current cycle
          const currentCyclePR = data.pullRequests.find((pr: PullRequest) => {
            const prDate = new Date(pr.submittedAt);
            const cycleEnd = new Date();
            cycleEnd.setUTCDate(
              cycleEnd.getUTCDate() + ((4 + 7 - cycleEnd.getUTCDay()) % 7)
            );
            cycleEnd.setUTCHours(23, 59, 0, 0);
            const cycleStart = new Date(cycleEnd);
            cycleStart.setUTCDate(cycleEnd.getUTCDate() - 7);
            return prDate >= cycleStart && prDate <= cycleEnd;
          });
          setCurrentCyclePR(currentCyclePR || null);
        }
      } catch (err) {
        console.error("Failed to fetch PR history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchPRHistory();
  }, [frameContext.user.fid]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextThursday = new Date();
      nextThursday.setUTCDate(
        nextThursday.getUTCDate() + ((4 + 7 - nextThursday.getUTCDay()) % 7)
      );
      nextThursday.setUTCHours(23, 59, 0, 0);

      const difference = nextThursday.getTime() - now.getTime();

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, []);

  const validatePrUrl = (url: string) => {
    try {
      const prUrl = new URL(url);
      const prUrlPattern =
        /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/;

      if (!prUrl.hostname.includes("github.com")) {
        setError("Please enter a valid GitHub pull request URL");
        setIsValidUrl(false);
        return false;
      }
      if (!prUrl.pathname.includes("/pull/")) {
        setError("URL must be a GitHub pull request");
        setIsValidUrl(false);
        return false;
      }

      if (!prUrlPattern.test(url)) {
        setError("Invalid GitHub pull request URL format");
        setIsValidUrl(false);
        return false;
      }

      setError(null);
      setIsValidUrl(true);
      return true;
    } catch (err) {
      setError("Please enter a valid URL");
      setIsValidUrl(false);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!githubUser?.username) {
      setError("GitHub account not connected");
      return;
    }

    if (!validatePrUrl(prUrl)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/upload-submissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_API_KEY,
          },
          body: JSON.stringify({
            fid: frameContext.user.fid,
            pullRequestUrl: prUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit PR");
      }

      setPrUrl("");
      setIsValidUrl(false);
      setCurrentCyclePR(data.pullRequest);
      setPrHistory((prev) => [data.pullRequest, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit PR");
    } finally {
      setIsSubmitting(false);
    }
  };

  const PRHistoryModal = () => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0a0a0a] border border-[#2DFF05]/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl text-[#2DFF05]">PR Submission History</h3>
          <button
            onClick={() => setShowHistoryModal(false)}
            className="text-[#2DFF05] hover:text-[#2DFF05]/70"
          >
            ✕
          </button>
        </div>
        {isLoadingHistory ? (
          <div className="text-center text-[#2DFF05]/70">Loading...</div>
        ) : (
          <div className="space-y-4">
            {prHistory.map((pr) => (
              <div
                key={pr.id}
                className="border border-[#2DFF05]/20 rounded-lg p-4 hover:bg-[#2DFF05]/5"
              >
                <p className="text-[#2DFF05]/90 mb-2">
                  Repository: {pr.githubRepoNameWithOwner}
                </p>
                <p className="text-[#2DFF05]/90 mb-2">
                  PR Number: #{pr.number}
                </p>
                <p className="text-[#2DFF05]/70 text-sm">
                  Submitted: {new Date(pr.submittedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-[#2DFF05] p-6 font-mono">
      <div className="max-w-4xl mx-auto">
        {/* Profile Section */}
        <div className="flex items-center justify-between mb-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2DFF05]/30">
          <div className="flex items-center space-x-4">
            <img
              src={frameContext.user.pfpUrl}
              alt={frameContext.user.username}
              className="w-16 h-16 rounded-full border-2 border-[#2DFF05] hover:border-4 transition-all"
            />
            <div>
              <p className="text-sm text-[#2DFF05]/70">
                GitHub: {githubUser.username}
              </p>
              <p className="text-sm text-[#2DFF05]/70">
                FID: {frameContext.user.fid}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-2 border border-[#2DFF05]/30 rounded hover:bg-[#2DFF05]/10 transition-colors cursor-pointer"
          >
            <LuScrollText />
          </button>
        </div>

        {/* Countdown Timer */}
        <div className="mb-4 text-center px-6 py-1 bg-[#0a0a0a] rounded-lg border border-[#2DFF05]/30">
          <p className="text-lg mt-2 text-[#2DFF05]/70">This cycle ends in:</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="bg-black p-3 rounded-lg">
                <div className="text-2xl font-bold">
                  {value.toString().padStart(2, "0")}
                </div>
                <div className="text-xs text-[#2DFF05]/70">{unit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Cycle PR */}
        {currentCyclePR && (
          <div className="mb-4 p-6 bg-[#0a0a0a] rounded-lg border border-[#2DFF05]/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg">Current Cycle Submission</h3>
              <button
                onClick={() => {
                  setEditCurrentCyclePR(!editCurrentCyclePR);
                }}
                className="p-2 border border-[#2DFF05]/30 rounded hover:bg-[#2DFF05]/10 transition-colors cursor-pointer"
              >
                <MdOutlineEdit />
              </button>
            </div>
            <div className="bg-black/50 p-4 rounded-lg border border-[#2DFF05]/20">
              <p className="text-sm text-[#2DFF05]/90 mb-2">
                Repository: {currentCyclePR.githubRepoNameWithOwner}
              </p>
              <p className="text-sm text-[#2DFF05]/90 mb-2">
                PR Number: #{currentCyclePR.number}
              </p>
              <p className="text-sm text-[#2DFF05]/90">
                Submitted:{" "}
                {new Date(currentCyclePR.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* PR Submission Form */}
        {(editCurrentCyclePR || !currentCyclePR) && (
          <div className="mb-4 p-6 bg-[#0a0a0a] rounded-lg border border-[#2DFF05]/30">
            <h3 className="text-lg mb-4">
              {currentCyclePR ? "Update" : "Submit"} Your PR
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="paste your best PR link here..."
                value={prUrl}
                onChange={(e) => {
                  setPrUrl(e.target.value);
                  validatePrUrl(e.target.value);
                }}
                className="w-full bg-black border border-[#2DFF05]/30 rounded-lg p-3 text-[#2DFF05] placeholder-[#2DFF05]/50 focus:outline-none focus:border-[#2DFF05] transition-colors"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {isValidUrl && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full p-3 rounded-lg border ${
                    isSubmitting
                      ? "bg-[#2DFF05]/10 border-[#2DFF05]/30 cursor-not-allowed"
                      : "bg-[#2DFF05]/20 border-[#2DFF05]/50 hover:bg-[#2DFF05]/30 cursor-pointer"
                  } transition-all`}
                >
                  {isSubmitting ? "Submitting..." : "Submit PR"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!currentCyclePR && (
          <div className="p-6 bg-[#0a0a0a] rounded-lg border border-[#2DFF05]/30">
            <ul className="list-disc list-inside space-y-2 text-sm text-[#2DFF05]/90">
              <li>
                Submit your best PR of this week before Thursday 23:59 UTC
              </li>
              <li>PRs must be to a public GitHub repository</li>
              <li>Winners are selected by a panel of 3 ai agents</li>
              <li>
                Weekly prizes for top 8 hackers. All trading fees of $hackathon.
              </li>
            </ul>
          </div>
        )}

        {showHistoryModal && <PRHistoryModal />}
      </div>
    </div>
  );
};

export default HackerDashboard;
