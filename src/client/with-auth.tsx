import * as React from "react";
import { figmaApi } from "../figma-api";

export const WithAuth = ({
  children
}: {
  children: (token: string) => React.ReactElement;
}) => {
  const [loadingToken, setLoadingToken] = React.useState(true);
  const [token, setToken] = React.useState(null);
  const [signingIn, setSigningIn] = React.useState(false);

  React.useEffect(() => {
    setLoadingToken(true);
    figmaApi
      .getToken()
      .then(token => {
        setToken(token);
        setLoadingToken(false);
      })
      .catch(err => {
        console.log(err);
        setLoadingToken(false);
      });
  }, [false]);

  const onSignin = () => {
    window.open(
      `https://github.com/login/oauth/authorize?scope=user:email&client_id=${
        process.env.GITHUB_CLIENT_ID
      }&redirect_uri=${encodeURIComponent(
        `${process.env.API_URL}/oauth/github/Figma`
      )}`
    );
    setSigningIn(true);
  };

  const onPasteToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value.trim();
    figmaApi.setToken(value);
    setToken(value);
    setSigningIn(false);
  };

  if (loadingToken) {
    return <p>Loading ...</p>;
  }

  if (token) {
    return children(token);
  }

  if (signingIn) {
    return (
      <input
        style={{ marginTop: 45 }}
        placeholder="Copy-Paste the Token here"
        onChange={onPasteToken}
      />
    );
  }

  return (
    <button id="signin" onClick={onSignin}>
      Signin
    </button>
  );
};
