export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-semibold tracking-tighter mb-4">
          VideoFlow
        </h1>
        <p className="text-xl text-zinc-400 mb-8">
          Your video catalog is loading...
        </p>
        <div className="text-sm text-zinc-500">
          We&apos;ll build the player + catalog here
        </div>
      </div>
    </div>
  );
}