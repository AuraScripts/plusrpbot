"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteMemberButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Remove this member authorization?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/members?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
