import * as React from "react";
import { useQuery } from "@apollo/react-hooks";
import { remoteAPI, GetOrgType } from "../remote-api";

export const OrgSelection = ({
  token,
  children
}: {
  token: string;
  children: (organisation: {
    name: string;
    id: string;
    repos: { url: string }[];
  }) => React.ReactElement;
}) => {
  const { loading, error, data } = useQuery<GetOrgType>(
    remoteAPI.getOrganisations,
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
    if (data && data.getMe.organisations.length === 1) {
      setSelectedOrg(data.getMe.organisations[0]);
    }
  }, [data]);

  if (loading) {
    return <p>Loading ...</p>;
  }

  if (error) {
    return <pre>{JSON.stringify(error, null, "  ")}</pre>;
  }

  if (!selectedOrg) {
    return (
      <div>
        <h1>select org</h1>
        <ul>
          {data.getMe.organisations.map(org => (
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
