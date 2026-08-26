export default function LoginPage({ searchParams }) {
  return (
    <main style={styles.main}>
      <form action="/api/login" method="POST" style={styles.card}>
        <h1 style={styles.title}>Dashboard login</h1>
        {searchParams?.error && <p style={styles.error}>Wrong password.</p>}
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Log in</button>
      </form>
    </main>
  );
}

const styles = {
  main: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1115', fontFamily: 'system-ui, sans-serif' },
  card: { background: '#171a21', padding: '2.5rem', borderRadius: '12px', width: '320px', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid #262a35' },
  title: { color: '#f2f3f5', fontSize: '1.25rem', margin: 0, marginBottom: '0.5rem' },
  input: { padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #2f3440', background: '#0f1115', color: '#f2f3f5', fontSize: '0.95rem' },
  button: { padding: '0.65rem 0.75rem', borderRadius: '8px', border: 'none', background: '#5865f2', color: 'white', fontWeight: 600, cursor: 'pointer' },
  error: { color: '#f87171', fontSize: '0.85rem', margin: 0 },
};
