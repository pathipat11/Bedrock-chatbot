/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);
        setError(null);
        setLoading(true);

        try {
            await apiPost("/api/auth/forgot-password", { email });
            // ✅ ไม่เปิดเผยว่ามี email นี้จริงหรือไม่
            setMsg("If the email exists, a reset link has been sent.");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-black p-4">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950"
            >
                <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    Forgot password
                </h1>

                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Enter your email and we’ll send you a link to reset your password.
                </p>

                <input
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:bg-zinc-900 dark:focus:ring-zinc-800"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button
                    disabled={loading}
                    className="w-full rounded-xl bg-black py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                    {loading ? "Sending…" : "Send reset link"}
                </button>

                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                    <Link href="/login" className="underline">
                        Back to login
                    </Link>
                    <Link href="/register" className="underline">
                        Create account
                    </Link>
                </div>

                {error && (
                    <p className="text-sm text-red-600 whitespace-pre-wrap">
                        {error}
                    </p>
                )}

                {msg && (
                    <p className="text-sm text-green-600 whitespace-pre-wrap">
                        {msg}
                    </p>
                )}
            </form>
        </div>
    );
}
