"use client";

import { useEffect, useState } from "react";

type Config = {
  clientId: string;
  hasClientSecret: boolean;
  hasBotToken: boolean;
  guildId: string;
  verifiedRoleId: string;
  brandName: string;
  brandLogo: string;
  brandDescription: string;
  accentColor: string;
  requestEmail: boolean;
  requestGuilds: boolean;
  successRedirect: string;
};

export default function SettingsPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [botToken, setBotToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setMsg("Failed to load settings"));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setMsg("");

    const body: Record<string, unknown> = { ...config };
    if (clientSecret.trim()) body.clientSecret = clientSecret.trim();
    if (botToken.trim()) body.botToken = botToken.trim();

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      setMsg("Saved successfully");
      setClientSecret("");
      setBotToken("");
      // refresh has* flags
      const fresh = await fetch("/api/settings").then((r) => r.json());
      setConfig(fresh);
    } catch {
      setMsg("Error saving");
    } finally {
      setSaving(false);
    }
  }

  if (!config) {
    return <div className="text-[var(--muted)]">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-[var(--muted)] mb-8">
        Discord application, target server, and branding
      </p>

      <form onSubmit={save} className="space-y-8 max-w-2xl">
        {/* Discord App */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <h2 className="font-semibold text-lg">Discord Application</h2>
          <p className="text-xs text-[var(--muted)]">
            Create an application at{" "}
            <a
              href="https://discord.com/developers/applications"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--primary)] underline"
            >
              Discord Developer Portal
            </a>
            . Set Redirect URI to{" "}
            <code className="bg-black/30 px-1 rounded">
              https://your-domain.com/api/auth/callback
            </code>
          </p>

          <Field
            label="Client ID"
            value={config.clientId}
            onChange={(v) => setConfig({ ...config, clientId: v })}
          />
          <Field
            label={
              config.hasClientSecret
                ? "Client Secret (leave blank to keep current)"
                : "Client Secret"
            }
            value={clientSecret}
            onChange={setClientSecret}
            type="password"
            placeholder={config.hasClientSecret ? "••••••••" : ""}
          />
          <Field
            label={
              config.hasBotToken
                ? "Bot Token (leave blank to keep current)"
                : "Bot Token"
            }
            value={botToken}
            onChange={setBotToken}
            type="password"
            placeholder={config.hasBotToken ? "••••••••" : ""}
          />
        </section>

        {/* Server */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <h2 className="font-semibold text-lg">Target Server</h2>
          <Field
            label="Guild / Server ID"
            value={config.guildId}
            onChange={(v) => setConfig({ ...config, guildId: v })}
            placeholder="123456789012345678"
          />
          <Field
            label="Verified Role ID (optional)"
            value={config.verifiedRoleId}
            onChange={(v) => setConfig({ ...config, verifiedRoleId: v })}
            placeholder="Role given on verify / pull"
          />
        </section>

        {/* Branding */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <h2 className="font-semibold text-lg">Branding (Verify Page)</h2>
          <Field
            label="Brand Name"
            value={config.brandName}
            onChange={(v) => setConfig({ ...config, brandName: v })}
          />
          <Field
            label="Logo URL"
            value={config.brandLogo}
            onChange={(v) => setConfig({ ...config, brandLogo: v })}
            placeholder="https://..."
          />
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">
              Description
            </label>
            <textarea
              value={config.brandDescription}
              onChange={(e) =>
                setConfig({ ...config, brandDescription: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>
          <Field
            label="Accent Color"
            value={config.accentColor}
            onChange={(v) => setConfig({ ...config, accentColor: v })}
            placeholder="#5865F2"
          />
        </section>

        {/* Scopes */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <h2 className="font-semibold text-lg">OAuth Scopes</h2>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={config.requestEmail}
              onChange={(e) =>
                setConfig({ ...config, requestEmail: e.target.checked })
              }
              className="rounded"
            />
            Request email scope
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={config.requestGuilds}
              onChange={(e) =>
                setConfig({ ...config, requestGuilds: e.target.checked })
              }
              className="rounded"
            />
            Request guilds scope (list user servers)
          </label>
          <Field
            label="Success Redirect URL (optional)"
            value={config.successRedirect}
            onChange={(v) => setConfig({ ...config, successRedirect: v })}
            placeholder="https://discord.gg/your-invite"
          />
        </section>

        {msg && (
          <div
            className={`rounded-lg px-4 py-2 text-sm ${
              msg.includes("Error")
                ? "bg-red-500/10 text-red-300"
                : "bg-green-500/10 text-green-300"
            }`}
          >
            {msg}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-[var(--muted)] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
      />
    </div>
  );
}
