"use client";

import { useEffect, useState } from "react";
import { buildAuthorizeUrl } from "@/lib/discord-client";

export default function OAuthPage() {
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [scopes, setScopes] = useState({
    identify: true,
    guildsJoin: true,
    email: false,
    guilds: false,
  });
  const [url, setUrl] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((c) => {
        setClientId(c.clientId || "");
        setScopes((s) => ({
          ...s,
          email: !!c.requestEmail,
          guilds: !!c.requestGuilds,
        }));
      });

    if (typeof window !== "undefined") {
      setRedirectUri(`${window.location.origin}/api/auth/callback`);
    }
  }, []);

  useEffect(() => {
    if (!clientId || !redirectUri) {
      setUrl("");
      return;
    }
    const scopeList = ["identify"];
    if (scopes.guildsJoin) scopeList.push("guilds.join");
    if (scopes.email) scopeList.push("email");
    if (scopes.guilds) scopeList.push("guilds");

    setUrl(
      buildAuthorizeUrl({
        clientId,
        redirectUri,
        scopes: scopeList,
      })
    );
  }, [clientId, redirectUri, scopes]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">OAuth2 URL Generator</h1>
      <p className="text-sm text-[var(--muted)] mb-8">
        Generate the authorization link you can share or embed
      </p>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">
              Client ID
            </label>
            <input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">
              Redirect URI
            </label>
            <input
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-[var(--muted)]">Scopes</label>
            {(
              [
                ["identify", "identify"],
                ["guildsJoin", "guilds.join"],
                ["email", "email"],
                ["guilds", "guilds"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={scopes[key]}
                  onChange={(e) =>
                    setScopes({ ...scopes, [key]: e.target.checked })
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {url && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <label className="block text-sm text-[var(--muted)] mb-2">
              Generated URL
            </label>
            <textarea
              readOnly
              value={url}
              rows={4}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-xs font-mono outline-none"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(url)}
              className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
            >
              Copy URL
            </button>
          </div>
        )}

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="font-semibold mb-2">Public Verify Page</h3>
          <p className="text-sm text-[var(--muted)] mb-3">
            Or just share this page — it uses the settings above automatically:
          </p>
          <a
            href="/verify"
            target="_blank"
            className="text-[var(--primary)] underline text-sm"
          >
            /verify
          </a>
        </div>
      </div>
    </div>
  );
}
