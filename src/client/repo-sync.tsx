import * as React from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import * as Octokit from "@octokit/rest";
import { remoteAPI, GetInstallationTokenType } from "../remote-api";
import { figmaApi } from "../figma-api";

export const RepoSync = ({
  repo,
  token
}: {
  repo: { url: string };
  token: string;
}) => {
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
      const github = new Octokit({ auth: data.getRepo.installationToken });

      const res = await github.repos.getContents({
        owner: repo.url.replace("https://github.com/", "").split("/")[0],
        repo: repo.url.replace("https://github.com/", "").split("/")[1],
        path: "colors.json",
        mediaType: {
          format: "raw"
        }
      });
      // @ts-ignore
      const content = JSON.parse(res.data);

      figmaApi.importTokens(content);
    }
  });

  const onClick = () => {
    if (called) {
      refetch();
    } else {
      loadInstallationToken();
    }
  };

  if (loading) {
    return <p>Loading ...</p>;
  }

  if (error) {
    return <pre>{JSON.stringify(error, null, "  ")}</pre>;
  }

  return <button onClick={onClick}>Sync</button>;
};
