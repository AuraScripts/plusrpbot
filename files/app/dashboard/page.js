import { listVerifiedMembers, countVerifiedMembers } from '../../lib/db';
import InviteButton from './InviteButton';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [members, count] = await Promise.all([listVerifiedMembers(), countVerifiedMembers()]);

  return (
    <main style={styles.main}>
      <div style={styles.header}>
        <h1 style={styles.title}>Verified members</h1>
        <p style={styles.count}>{count} total</p>
      </div>

      <InviteButton />

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}></th>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Discord ID</th>
              <th style={styles.th}>Verified at</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.discord_id}>
                <td style={styles.td}><img src={m.avatar_url} alt="" width={28} height={28} style={{ borderRadius: '50%' }} /></td>
                <td style={styles.td}>{m.username}</td>
                <td style={{ ...styles.td, color: '#6b7280', fontFamily: 'monospace' }}>{m.discord_id}</td>
                <td style={styles.td}>{new Date(m.verified_at).toLocaleString()}</td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td style={styles.td} colSpan={4}>No one has verified yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const styles = {
  main: { minHeight: '100vh', background: '#0f1115', fontFamily: 'system-ui, sans-serif', padding: '2.5rem', color: '#f2f3f5' },
  header: { display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem' },
  title: { margin: 0, fontSize: '1.5rem' },
  count: { margin: 0, color: '#9aa0ac' },
  tableWrap: { marginTop: '1.5rem', border: '1px solid #262a35', borderRadius: '10px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#171a21', color: '#9aa0ac', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' },
  td: { padding: '0.65rem 1rem', borderTop: '1px solid #1f232b', fontSize: '0.9rem' },
};
