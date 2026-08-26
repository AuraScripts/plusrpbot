'use client';
import { useState } from 'react';

export default function InviteButton() {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setUrl(null);
    try {
      const res = await fetch('/api/invite', { method: 'POST' });
      const data = await res.json();
      if (data.url) setUrl(data.url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      <button onClick={generate} disabled={loading} style={styles.button}>
        {loading ? 'Generating…' : 'Generate invite link'}
      </button>
      {url && (
        <a href={url} target="_blank" rel="noreferrer" style={styles.link}>{url}</a>
      )}
    </div>
  );
}

const styles = {
  button: { padding: '0.6rem 1.1rem', borderRadius: '8px', border: 'none', background: '#5865f2', color: 'white', fontWeight: 600, cursor: 'pointer' },
  link: { color: '#8ab4ff', fontFamily: 'monospace', fontSize: '0.85rem' },
};
