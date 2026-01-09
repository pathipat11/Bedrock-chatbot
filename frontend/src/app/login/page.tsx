/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const r = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);
        try {
            const data = await apiPost("/api/auth/login", { email, password });
            setToken(data.access_token);
            window.dispatchEvent(new Event("auth:changed"));
            r.push("/chat");
        } catch (err: any) {
            setMsg(err.message);
        }
    }

    return (
        <div className="min-h-[calc(100vh-56px)] grid place-items-center bg-base-200 p-4">
            <form onSubmit={onSubmit} className="card w-full max-w-md bg-base-100 shadow">
                <div className="card-body space-y-2">
                    <h1 className="card-title text-2xl">Welcome back</h1>
                    <p className="text-sm opacity-70">Sign in to continue.</p>

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
                        <div className="label"><span className="label-text">Password</span></div>
                        <input
                            className="input input-bordered w-full"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>

                    <button className="btn btn-primary w-full">Sign in</button>

                    <div className="flex justify-between text-sm">
                        <Link className="link" href="/register">Create account</Link>
                        <Link className="link" href="/forgot-password">Forgot password</Link>
                    </div>

                    {msg && <div className="alert alert-error"><span>{msg}</span></div>}
                </div>
            </form>
        </div>
    );
}
