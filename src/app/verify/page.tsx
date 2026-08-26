export default function VerifyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Account Verification</h1>
        <p className="text-zinc-400 mb-6">
          Click the button below to authorize with Discord. This allows us to verify your account and join you to our servers.
        </p>
        <a
          href="/api/auth/login"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-8 rounded-lg transition"
        >
          Authorize with Discord
        </a>
      </div>
    </main>
  );
}
