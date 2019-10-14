import ApolloClient from "apollo-boost";

export const client = new ApolloClient({
  uri: `${process.env.API_URL}/graphql`
});

export type GetOrgType = {
  getMe: {
    organisations: {
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
  getOrganisations: require("./queries/get-organisations.graphql"),
  getInstallationToken: require("./queries/get-installation-token.graphql")
};
