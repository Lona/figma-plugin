import * as React from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import * as Octokit from "@octokit/rest";
import { remoteAPI, GetInstallationTokenType } from "../remote-api";
import { figmaApi } from "../figma-api";
import { ConvertedWorkspace } from "../tokens";

export const RepoSync = ({
  repo,
  token
}: {
  repo: { url: string };
  token: string;
}) => {
  const [githubError, setGithubError] = React.useState(null);
  const [githubLoading, setGithubLoading] = React.useState(false);

  const [
    loadInstallationToken,
    { called, loading, error, data, refetch }
  ] = useLazyQuery<GetInstallationTokenType>(remoteAPI.getInstallationToken, {
    variables: { repo: repo.url },
    context: {
      headers: {
        Authorization: "Bearer " + token
      }
    },
    async onCompleted(data) {
      setGithubLoading(true);
      const github = new Octokit({ auth: data.getRepo.installationToken });

      const params = {
        owner: repo.url.replace("https://github.com/", "").split("/")[0],
        repo: repo.url.replace("https://github.com/", "").split("/")[1]
      };

      const release = await github.repos.getLatestRelease(params);

      const flatTokens =
        release && release.data && release.data.assets
          ? release.data.assets.find(x => x.name === "tokens.json")
          : undefined;

      if (!flatTokens) {
        setGithubLoading(false);
        setGithubError(
          new Error("could not find the tokens in the latest release")
        );
        return;
      }

      const res = await github.repos.getReleaseAsset({
        owner: repo.url.replace("https://github.com/", "").split("/")[0],
        repo: repo.url.replace("https://github.com/", "").split("/")[1],
        asset_id: flatTokens.id,
        headers: {
          Accept: "application/octet-stream"
        }
      });

      // @ts-ignore
      const content: ConvertedWorkspace = JSON.parse(res.data);

      await figmaApi.importTokens(content);
      setGithubLoading(false);
    }
  });

  const onClick = () => {
    if (called) {
      refetch();
    } else {
      loadInstallationToken();
    }
  };

  if (loading || githubLoading) {
    return <p>Loading ...</p>;
  }

  if (error || githubError) {
    return (
      <div>
        <pre>{JSON.stringify(error || githubError, null, "  ")}</pre>
        <button onClick={onClick}>Try Again</button>
      </div>
    );
  }

  return <button onClick={onClick}>Sync</button>;
};
