/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

function scorePassword(pw: string) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(s, 5);
}

export default function RegisterPage() {
    const r = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const score = useMemo(() => scorePassword(password), [password]);
    const percent = (score / 5) * 100;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);
        setError(null);

        if (password.length < 8) return setError("Password must be at least 8 characters.");
        if (password !== confirmPassword) return setError("Passwords do not match.");

        setBusy(true);
        try {
            await apiPost("/api/auth/register", { email, username, password });
            setMsg("Registered successfully. Redirecting to login…");
            setTimeout(() => r.push("/login"), 800);
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-56px)] grid place-items-center bg-base-200 p-4">
            <form onSubmit={onSubmit} className="card w-full max-w-md bg-base-100 shadow">
                <div className="card-body space-y-2">
                    <h1 className="card-title text-2xl">Create account</h1>
                    <p className="text-sm opacity-70">Start chatting with Bedrock.</p>

                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Email</span></div>
                        <input
                            className="input input-bordered w-full"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Username</span></div>
                        <input
                            className="input input-bordered w-full"
                            placeholder="pathipat"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </label>

                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Password</span></div>
                        <input
                            className="input input-bordered w-full"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="mt-2 h-1 w-full bg-base-200 rounded-full overflow-hidden">
                            <div className="h-1 bg-primary" style={{ width: `${percent}%` }} />
                        </div>
                        <div className="text-xs opacity-60 mt-1">
                            Strength: {score <= 1 ? "Weak" : score <= 3 ? "Okay" : "Strong"}
                        </div>
                    </label>

                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Confirm password</span></div>
                        <input
                            className="input input-bordered w-full"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </label>

                    <button className="btn btn-primary w-full" disabled={busy}>
                        {busy ? <span className="loading loading-spinner" /> : "Create account"}
                    </button>

                    <div className="text-sm">
                        Already have an account? <Link className="link" href="/login">Login</Link>
                    </div>

                    {error && <div className="alert alert-error"><span>{error}</span></div>}
                    {msg && <div className="alert alert-success"><span>{msg}</span></div>}
                </div>
            </form>
        </div>
    );
}
