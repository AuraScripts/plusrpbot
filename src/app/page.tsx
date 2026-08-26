export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">FiveM Auth</h1>
      <p className="text-zinc-400 mb-8">Discord verification system</p>
      <a
        href="/verify"
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-6 rounded-lg transition"
      >
        Verify Account
      </a>
    </main>
  );
}
