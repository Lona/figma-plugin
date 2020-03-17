import * as React from "react";
import useFigmaSetting from "figma-jsonrpc/hooks/useFigmaSetting";

export const WithAuth = ({
  children
}: {
  children: (
    token: string,
    setToken: (token: string | null) => void
  ) => React.ReactElement;
}) => {
  const [signingIn, setSigningIn] = React.useState(false);
  const [token, error, loadingToken, setToken] = useFigmaSetting<string>(
    "lona-token"
  );

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
    setToken(value);
    setSigningIn(false);
  };

  if (loadingToken) {
    return <p>Loading ...</p>;
  }

  if (token) {
    return children(token, setToken);
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
