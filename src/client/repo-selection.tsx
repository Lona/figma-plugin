import * as React from "react";

export const RepoSelection = ({
  organisation,
  children
}: {
  organisation: { name: string; id: string; repos: { url: string }[] };
  children: (repo: { url: string }) => React.ReactElement;
}) => {
  const [selectedRepo, setSelectedRepo] = React.useState(
    organisation.repos.length === 1 ? organisation.repos[0] : null
  );

  if (!selectedRepo) {
    return (
      <div>
        <h1>select repo</h1>
        <ul>
          {organisation.repos.map(repo => (
            <li key={repo.url}>
              <a onClick={() => setSelectedRepo(repo)}>{repo.url}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return children(selectedRepo);
};
