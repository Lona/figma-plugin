import * as React from "react";
import { useQuery } from "@apollo/react-hooks";
import { remoteAPI, GetOrgType } from "../remote-api";

export const OrgSelection = ({
  token,
  setToken,
  children
}: {
  token: string;
  setToken: (token: string | null) => void;
  children: (organization: {
    name: string;
    id: string;
    repos: { url: string }[];
  }) => React.ReactElement;
}) => {
  const { loading, error, data } = useQuery<GetOrgType>(
    remoteAPI.getOrganizations,
    {
      context: {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    }
  );

  const [selectedOrg, setSelectedOrg] = React.useState(null);

  React.useEffect(() => {
    if (data && data.getMe.organizations.length === 1) {
      setSelectedOrg(data.getMe.organizations[0]);
    }
  }, [data]);

  React.useEffect(() => {
    if (error) {
      console.error(error);
      setToken(null);
    }
  }, [error]);

  if (loading || error) {
    return <p>Loading ...</p>;
  }

  if (!selectedOrg) {
    return (
      <div>
        <h1>select org</h1>
        <ul>
          {data.getMe.organizations.map(org => (
            <li key={org.id}>
              <a onClick={() => setSelectedOrg(org)}>{org.name}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return children(selectedOrg);
};
