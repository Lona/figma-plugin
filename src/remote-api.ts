import ApolloClient from "apollo-boost";

export const client = new ApolloClient({
  uri: `${process.env.API_URL}/graphql`
});

export type GetOrgType = {
  getMe: {
    organizations: {
      name: string;
      id: string;
      repos: { url: string }[];
    }[];
  };
};

export type GetInstallationTokenType = {
  getRepo: {
    installationToken: string;
  };
};

export const remoteAPI = {
  getOrganizations: require("./queries/get-organizations.graphql"),
  getInstallationToken: require("./queries/get-installation-token.graphql")
};
