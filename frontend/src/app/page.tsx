import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-56px)] grid place-items-center bg-base-200 p-6">
      <div className="card w-full max-w-3xl bg-base-100 shadow">
        <div className="card-body space-y-2">
          <h1 className="card-title text-3xl">Bedrock Chatbot</h1>
          <p className="opacity-70">
            Next.js + FastAPI + PostgreSQL + Amazon Bedrock (Claude) with streaming.
          </p>

          <div className="pt-4 flex flex-col gap-2 sm:flex-row">
            <Link href="/login" className="btn btn-primary">
              Login
            </Link>
            <Link href="/register" className="btn btn-outline">
              Create account
            </Link>
            <Link href="/chat" className="btn btn-ghost">
              Open chat
            </Link>
          </div>

          <div className="pt-6 text-sm opacity-70">
            Tip: backend <span className="font-mono">:8000</span> • frontend{" "}
            <span className="font-mono">:3000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
