export function buildAuthorizeUrl(opts: {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state?: string;
}) {
  const params = new URLSearchParams({
    client_id: opts.clientId,
    response_type: "code",
    redirect_uri: opts.redirectUri,
    scope: opts.scopes.join(" "),
    prompt: "consent",
  });
  if (opts.state) params.set("state", opts.state);
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
