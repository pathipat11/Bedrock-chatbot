/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken, clearToken, Me } from "@/lib/auth";
import { apiGet } from "@/lib/api";

type Theme = "light" | "dark";

function getTheme(): Theme {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function applyTheme(t: Theme) {
    document.documentElement.setAttribute("data-theme", t);
    window.localStorage.setItem("theme", t);
}

export default function Navbar() {
    const [me, setMe] = useState<Me | null>(null);
    const [theme, setTheme] = useState<Theme>("light");

    async function refreshMe() {
        const token = getToken();
        if (!token) return setMe(null);
        try {
            const data = await apiGet("/api/auth/me", token);
            setMe(data);
        } catch {
            clearToken();
            setMe(null);
        }
    }

    useEffect(() => {
        const t = getTheme();
        setTheme(t);
        applyTheme(t);

        refreshMe();
        const onAuth = () => refreshMe();
        window.addEventListener("auth:changed", onAuth);
        return () => window.removeEventListener("auth:changed", onAuth);
    }, []);

    function logout() {
        clearToken();
        window.dispatchEvent(new Event("auth:changed"));
        window.location.href = "/login";
    }

    function toggleTheme() {
        const next: Theme = theme === "light" ? "dark" : "light";
        setTheme(next);
        applyTheme(next);
    }

    return (
        <div className="navbar bg-base-100 border-b sticky top-0 z-50">
            <div className="mx-auto w-full max-w-6xl px-4 flex items-center">
                <div className="flex-1">
                    <Link href="/" className="btn btn-ghost text-lg normal-case">
                        Bedrock Chatbot
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className="btn btn-ghost btn-sm" title="Toggle theme">
                        {theme === "light" ? "🌞" : "🌙"}
                    </button>

                    {me ? (
                        <>
                            <Link href="/chat" className="btn btn-ghost btn-sm">
                                Chat
                            </Link>

                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                                    @{me.username}
                                </div>
                                <ul
                                    tabIndex={0}
                                    className="dropdown-content menu bg-base-100 rounded-box border w-52 p-2 shadow"
                                >
                                    <li>
                                        <button onClick={logout}>Logout</button>
                                    </li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="btn btn-ghost btn-sm">
                                Login
                            </Link>
                            <Link href="/register" className="btn btn-primary btn-sm">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
