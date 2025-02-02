import { GitHubProvider } from "./GithubProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <GitHubProvider>{children}</GitHubProvider>;
}
