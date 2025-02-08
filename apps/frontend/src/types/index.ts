import type { FrameContext } from '../components/providers/FarcasterProvider';
import type { GithubUser } from '../components/providers/GithubProvider';

export interface HackerDashboardProps {
  frameContext: FrameContext;
  githubUser: GithubUser;
}

export interface PullRequest {
  id: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  number: number;
  githubRepoNameWithOwner: string;
}
