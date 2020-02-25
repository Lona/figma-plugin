import * as React from "react";
import { figmaApi } from "../figma-api";
import { ConvertedWorkspace } from "../tokens";

export const RepoSync = ({
  repo,
  token,
  organisation
}: {
  repo: { url: string };
  token: string;
  organisation: { name: string; id: string; repos: { url: string }[] };
}) => {
  const [githubError, setGithubError] = React.useState(null);
  const [githubLoading, setGithubLoading] = React.useState(false);

  const importTokens = React.useCallback(async () => {
    if (githubLoading) {
      console.log("already loading");
      return;
    }
    setGithubLoading(true);

    try {
      const res: ConvertedWorkspace = await (
        await fetch(
          `${process.env.S3_URL}/${organisation.id}/flat-tokens.json`,
          {
            headers: {
              Authorization: "Bearer " + token
            }
          }
        )
      ).json();

      await figmaApi.importTokens(res);
      setGithubLoading(false);
    } catch (err) {
      setGithubLoading(false);
      setGithubError(err);
    }
  }, []);

  if (githubLoading) {
    return <p>Loading ...</p>;
  }

  if (githubError) {
    return (
      <div>
        <pre>{JSON.stringify(githubError, null, "  ")}</pre>
        <button onClick={importTokens}>Try Again</button>
      </div>
    );
  }

  return <button onClick={importTokens}>Sync</button>;
};
