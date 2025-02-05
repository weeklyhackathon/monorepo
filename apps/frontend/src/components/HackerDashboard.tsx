import { useEffect, useState } from "react";
import { FrameContext } from "./providers/FarcasterProvider";
import { GithubUser } from "./providers/GithubProvider";

interface HackerDashboardProps {
  frameContext: FrameContext;
  githubUser: GithubUser;
}

const HackerDashboard = ({
  githubUser,
  frameContext,
}: HackerDashboardProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

  return (
    <div className="min-h-screen bg-black text-[#2DFF05] p-6 font-mono">
      <div className="max-w-4xl mx-auto">
        {/* Profile Section */}
        <div className="flex items-center space-x-4 mb-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2DFF05]/30">
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
        </div>

        {/* Countdown Timer */}
        <div className="mb-4 text-center px-6 py-1 bg-[#0a0a0a] rounded-lg border border-[#2DFF05]/30">
          <div className="grid grid-cols-4 gap-4">
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

        {/* PR Submission */}
        <div className="mb-4 p-6 bg-[#0a0a0a] rounded-lg border border-[#2DFF05]/30">
          <h3 className="text-lg mb-4">Submit Your PR</h3>
          <input
            type="text"
            placeholder="paste your best PR link here..."
            className="w-full bg-black border border-[#2DFF05]/30 rounded-lg p-3 text-[#2DFF05] placeholder-[#2DFF05]/50 focus:outline-none focus:border-[#2DFF05] transition-colors"
          />
        </div>

        {/* Instructions */}
        <div className="p-6 bg-[#0a0a0a] rounded-lg border border-[#2DFF05]/30">
          <h3 className="text-lg mb-4">How to Participate</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-[#2DFF05]/90">
            <li>Submit your best PR of this week before Thursday 23:59 UTC</li>
            <li>PRs must be to a public GitHub repositorie</li>
            <li>Winners are selected by a panel of 3 ai agents</li>
            <li>
              Weekly prizes for top 8 hackers. All trading fees of $hackathon.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HackerDashboard;
