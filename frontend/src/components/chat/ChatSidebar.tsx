/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

type Conv = { id: string; title: string | null; created_at: string };

export default function ChatSidebar() {
    const [items, setItems] = useState<Conv[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const pathname = usePathname();
    const r = useRouter();
    const token = getToken();

    async function refresh() {
        if (!token) return;
        setLoading(true);
        setErr(null);
        try {
            const data = await apiGet("/api/conversations", token);
            setItems(data);
        } catch (e: any) {
            setErr(String(e?.message || e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!token) return;
        refresh();
        window.addEventListener("conversations:refresh", refresh);
        return () => window.removeEventListener("conversations:refresh", refresh);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    async function newChat() {
        if (!token) return r.push("/login");
        const data = await apiPost("/api/conversations", {}, token);
        window.dispatchEvent(new Event("conversations:refresh"));
        r.push(`/chat/${data.id}`);
    }

    function logout() {
        clearToken();
        window.dispatchEvent(new Event("auth:changed"));
        window.location.href = "/login";
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 flex items-center justify-between">
                <div className="font-semibold">Chats</div>
                <button onClick={newChat} className="btn btn-primary btn-sm">
                    New
                </button>
            </div>

            <div className="px-4 pb-3">
                <button onClick={logout} className="btn btn-outline btn-sm w-full">
                    Logout
                </button>
            </div>

            <div className="px-4 pb-2 text-xs opacity-70">
                {loading ? "Loading…" : err ? "Error loading chats" : `${items.length} chats`}
            </div>

            {err ? (
                <div className="px-4 pb-2">
                    <div className="alert alert-error py-2">
                        <span className="text-sm">{err}</span>
                    </div>
                </div>
            ) : null}

            <div className="flex-1 overflow-y-auto px-2 pb-4">
                <ul className="menu bg-base-100 rounded-box">
                    {items.map((c) => {
                        const active = pathname?.includes(`/chat/${c.id}`);
                        const title = (c.title && c.title.trim()) || "Untitled";
                        return (
                            <li key={c.id}>
                                <Link
                                    href={`/chat/${c.id}`}
                                    className={active ? "active" : ""}
                                    title={title}
                                >
                                    <span className="truncate">{title}</span>
                                    <span className="text-[11px] opacity-60">
                                        {new Date(c.created_at).toLocaleString()}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="border-t p-4 text-xs opacity-70">
                daisyUI • SSE • Bedrock
            </div>
        </div>
    );
}
