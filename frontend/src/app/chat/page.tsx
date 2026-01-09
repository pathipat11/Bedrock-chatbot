"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";

export default function ChatIndexPage() {
    const r = useRouter();

    useEffect(() => {
        const token = getToken();
        if (!token) {
            r.replace("/login");
            return;
        }

        (async () => {
            // 1) ลองเปิด chat ล่าสุดก่อน
            const list = await apiGet("/api/conversations", token);
            if (Array.isArray(list) && list.length > 0) {
                r.replace(`/chat/${list[0].id}`); // list ถูก sort desc แล้วใน backend
                return;
            }

            // 2) ถ้าไม่มีเลย ค่อยสร้างใหม่
            const created = await apiPost("/api/conversations", {}, token);
            r.replace(`/chat/${created.id}`);
        })().catch(() => r.replace("/login"));
    }, [r]);

    return (
        <div className="grid min-h-[calc(100vh-56px)] place-items-center p-6">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Opening chat…</div>
        </div>
    );
}
