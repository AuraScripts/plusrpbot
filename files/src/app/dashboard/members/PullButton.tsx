"use client";

import { useState } from "react";

export function PullButton({ count }: { count: number }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handlePull() {
    if (
      !confirm(
        `Pull ${count} member(s) into the configured guild?\n\nThis will be rate-limited and may take a while.`
      )
    ) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/pull", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResult(`Error: ${data.error || "failed"}`);
      } else {
        setResult(
          `Done: ${data.success} added, ${data.already} already in, ${data.failed} failed`
        );
      }
    } catch {
      setResult("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handlePull}
        disabled={loading || count === 0}
        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition"
      >
        {loading ? "Pulling..." : `Pull All Members (${count})`}
      </button>
      {result && (
        <p className="text-xs text-[var(--muted)] max-w-xs text-right">
          {result}
        </p>
      )}
    </div>
  );
}
