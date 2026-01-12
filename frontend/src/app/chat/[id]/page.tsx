/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import ChatComposer from "@/components/chat/ChatComposer";
import { streamChatSSE } from "@/components/chat/stream";


type Msg = { role: "user" | "assistant"; content: string; created_at?: string };

function makeTitleFrom(text: string) {
    const t = text.trim().replace(/\s+/g, " ");
    // ตัดพวก markdown code fence ออกนิดหน่อย
    const cleaned = t.replace(/```[\s\S]*?```/g, "").trim();
    const base = cleaned || t;
    return base.length > 48 ? base.slice(0, 48) + "…" : base;
}


export default function ChatRoomPage() {
    const { id } = useParams<{ id: string }>();
    const r = useRouter();

    const [msgs, setMsgs] = useState<Msg[]>([]);
    const [loading, setLoading] = useState(true);
    const [streaming, setStreaming] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [didTitle, setDidTitle] = useState(false);


    const abortRef = useRef<AbortController | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const token = useMemo(() => getToken(), []);

    useEffect(() => {
        if (!token) {
            r.replace("/login");
            return;
        }

        (async () => {
            setLoading(true);
            setErr(null);
            const data = await apiGet(`/api/conversations/${id}/messages`, token);
            const filtered: Msg[] = (data || [])
                .filter((m: any) => m.role === "user" || m.role === "assistant")
                .map((m: any) => ({ role: m.role, content: m.content, created_at: m.created_at }))
                .sort((a: { created_at: any; }, b: { created_at: any; }) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

            setMsgs(filtered);

            setLoading(false);
        })().catch((e) => {
            setErr(String(e?.message || e));
            setLoading(false);
        });
    }, [id, r, token]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [msgs]);

    async function apiPostOrPatchTitle(token: string, id: string, title: string) {
        const API = process.env.NEXT_PUBLIC_API_BASE!;
        const res = await fetch(`${API}/api/conversations/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }

    async function onSend(text: string) {
        if (!token) return;
        setErr(null);

        setMsgs((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);

        if (!didTitle && msgs.filter((m) => m.role === "user").length === 0) {
            const title = makeTitleFrom(text);
            setDidTitle(true);
            apiPostOrPatchTitle(token, id, title)
                .then(() => window.dispatchEvent(new Event("conversations:refresh")))
                .catch(() => { });
        }

        setStreaming(true);

        const ac = new AbortController();
        abortRef.current = ac;

        try {
            await streamChatSSE({
                token,
                conversationId: id,
                message: text,
                signal: ac.signal,
                onMeta: (meta: any) => {
                    if (meta?.title) {
                        window.dispatchEvent(new Event("conversations:refresh"));
                    }
                },
                onDelta: (delta: string) => {
                    setMsgs((m) => {
                        const copy = [...m];
                        const last = copy.length - 1;
                        if (last >= 0 && copy[last].role === "assistant") {
                            copy[last] = { ...copy[last], content: copy[last].content + delta };
                        }
                        return copy;
                    });
                },
            });
        } catch (e: any) {
            if (e?.name !== "AbortError") setErr(String(e?.message || e));
        } finally {
            setStreaming(false);
            abortRef.current = null;
        }
    }

    function stop() {
        abortRef.current?.abort();
    }

    return (
        <div className="h-full flex flex-col">
            <div className="border-b p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm opacity-70">
                        Chat <span className="font-mono">#{id.slice(0, 8)}</span>
                    </div>

                    {streaming ? (
                        <button onClick={stop} className="btn btn-outline btn-sm">
                            Stop
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                    {loading ? <div className="text-sm opacity-70">Loading…</div> : null}
                    {msgs.map((m, i) => (
                        <MessageBubble key={i} role={m.role} content={m.content} />
                    ))}
                    <div ref={bottomRef} />
                </div>
            </div>

            {err ? (
                <div className="border-t p-3">
                    <div className="alert alert-error">
                        <span className="text-sm">{err}</span>
                    </div>
                </div>
            ) : null}

            <div className="border-t p-4">
                <ChatComposer disabled={streaming} onSend={onSend} />
                <div className="mt-2 text-xs opacity-70">
                    daisyUI • Streaming via SSE • Bedrock
                </div>
            </div>
        </div>
    );

}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
    const isUser = role === "user";
    return (
        <div className={`chat ${isUser ? "chat-end" : "chat-start"}`}>
            <div className="chat-bubble">
                {content || (role === "assistant" ? <span className="loading loading-dots loading-sm" /> : "")}
            </div>
        </div>
    );
}

