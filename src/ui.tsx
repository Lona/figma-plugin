import * as React from "react";
import * as ReactDOM from "react-dom";
import { ApolloProvider } from "@apollo/react-hooks";
import logo from "./logo.svg";
import { client } from "./remote-api";
import { WithAuth } from "./client/with-auth";
import { OrgSelection } from "./client/org-selection";
import { RepoSelection } from "./client/repo-selection";
import { RepoSync } from "./client/repo-sync";

import "./ui.css";

const App = () => {
  return (
    <ApolloProvider client={client}>
      <img src={logo} width={32} />
      <WithAuth>
        {token => (
          <OrgSelection token={token}>
            {org => (
              <RepoSelection organisation={org}>
                {repo => (
                  <RepoSync repo={repo} token={token} organisation={org} />
                )}
              </RepoSelection>
            )}
          </OrgSelection>
        )}
      </WithAuth>
    </ApolloProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("react-page"));
