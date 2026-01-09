/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { apiPost } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

/* ---------- password strength helper ---------- */
function passwordStrength(pw: string) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const labels = ["Weak", "Fair", "Good", "Strong"];
    const colors = [
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-green-600",
    ];

    return {
        score,
        label: labels[Math.max(0, score - 1)],
        color: colors[Math.max(0, score - 1)],
        percent: (score / 4) * 100,
    };
}

export default function ResetPasswordPage() {
    const params = useSearchParams();
    const token = params.get("token") || "";
    const r = useRouter();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const strength = useMemo(() => passwordStrength(password), [password]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);
        setError(null);

        if (!token) {
            setError("Invalid or expired reset link.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await apiPost("/api/auth/reset-password", {
                token,
                new_password: password,
            });
            setMsg("Password reset successful. Redirecting to login…");
            setTimeout(() => r.push("/login"), 1200);
        } catch (err: any) {
            setError(err.message || "Reset failed");
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
                    Reset password
                </h1>

                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Enter your new password below.
                </p>

                {/* password */}
                <div className="space-y-2">
                    <input
                        type="password"
                        placeholder="New password"
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:bg-zinc-900 dark:focus:ring-zinc-800"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* strength bar */}
                    {password && (
                        <div>
                            <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                                <div
                                    className={`h-1.5 rounded-full transition-all ${strength.color}`}
                                    style={{ width: `${strength.percent}%` }}
                                />
                            </div>
                            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                Strength: {strength.label}
                            </div>
                        </div>
                    )}
                </div>

                {/* confirm */}
                <input
                    type="password"
                    placeholder="Confirm password"
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:bg-zinc-900 dark:focus:ring-zinc-800"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                />

                <button
                    disabled={loading}
                    className="w-full rounded-xl bg-black py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                    {loading ? "Resetting…" : "Reset password"}
                </button>

                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    <Link href="/login" className="underline">
                        Back to login
                    </Link>
                </div>

                {error && (
                    <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
                )}

                {msg && (
                    <p className="text-sm text-green-600 whitespace-pre-wrap">{msg}</p>
                )}
            </form>
        </div>
    );
}
