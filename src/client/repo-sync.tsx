import * as React from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import * as Octokit from "@octokit/rest";
import { remoteAPI, GetInstallationTokenType } from "../remote-api";
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

  const [
    loadInstallationToken,
    { called, loading, error, refetch }
  ] = useLazyQuery<GetInstallationTokenType>(remoteAPI.getInstallationToken, {
    variables: { repo: repo.url },
    context: {
      headers: {
        Authorization: "Bearer " + token
      }
    },
    async onCompleted(data) {
      if (githubLoading) {
        console.log("already loading");
        return;
      }
      setGithubLoading(true);
      const github = new Octokit({ auth: data.getRepo.installationToken });

      const params = {
        owner: repo.url.replace("https://github.com/", "").split("/")[0],
        repo: repo.url.replace("https://github.com/", "").split("/")[1]
      };

      try {
        const release = await github.repos.getLatestRelease(params);

        const tagName = release && release.data && release.data.tag_name;

        if (!tagName) {
          throw new Error("could not find the tag in the latest release");
        }

        const res: ConvertedWorkspace = await (
          await fetch(
            `${process.env.S3_URL}/${organisation.id}/refs/tags/${tagName}/flat-json.json`
          )
        ).json();

        await figmaApi.importTokens(res);
        setGithubLoading(false);
      } catch (err) {
        setGithubLoading(false);
        setGithubError(err);
      }
    }
  });

  if (loading || githubLoading) {
    return <p>Loading ...</p>;
  }

  if (error || githubError) {
    return (
      <div>
        <pre>{JSON.stringify(error || githubError, null, "  ")}</pre>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  const onClick = () => {
    if (called) {
      refetch();
    } else {
      loadInstallationToken();
    }
  };

  return <button onClick={onClick}>Sync</button>;
};
