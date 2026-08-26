export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; username?: string; avatar?: string }>;
}) {
  const params = await searchParams;
  const { id, username, avatar } = params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-2 text-green-400">Verified!</h1>
        <p className="text-zinc-400 mb-6">
          Your Discord account has been successfully authorized.
        </p>

        {username && (
          <div className="mb-6">
            {avatar && (
              <img
                src={`https://cdn.discordapp.com/avatars/${id}/${avatar}.png`}
                alt="Avatar"
                className="w-20 h-20 rounded-full mx-auto mb-3"
              />
            )}
            <p className="text-lg font-medium">{username}</p>
            <p className="text-sm text-zinc-500">ID: {id}</p>
          </div>
        )}

        <p className="text-sm text-zinc-500">
          You can now close this page.
        </p>
      </div>
    </main>
  );
}
