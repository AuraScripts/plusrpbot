export default function Home({ searchParams }) {
  const verified = searchParams?.verified === '1';

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        {verified ? (
          <>
            <h1 style={styles.title}>You're verified ✅</h1>
            <p style={styles.subtitle}>You can close this tab and head back to Discord.</p>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Verify your account</h1>
            <p style={styles.subtitle}>
              This confirms your Discord identity so we can track membership.
              We only read your username — this never adds you to any server automatically.
            </p>
            <a href="/api/auth/discord" style={styles.button}>Verify with Discord</a>
          </>
        )}
      </div>
    </main>
  );
}

const styles = {
  main: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1115', fontFamily: 'system-ui, sans-serif', padding: '1rem' },
  card: { background: '#171a21', padding: '2.5rem', borderRadius: '12px', maxWidth: '420px', textAlign: 'center', border: '1px solid #262a35' },
  title: { color: '#f2f3f5', fontSize: '1.4rem', margin: '0 0 0.75rem' },
  subtitle: { color: '#9aa0ac', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 1.5rem' },
  button: { display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#5865f2', color: 'white', fontWeight: 600, textDecoration: 'none' },
};
