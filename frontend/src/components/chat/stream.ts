/* eslint-disable @typescript-eslint/no-explicit-any */
const API = process.env.NEXT_PUBLIC_API_BASE!;

export async function streamChatSSE(opts: {
    token: string;
    conversationId: string;
    message: string;
    signal?: AbortSignal;
    onMeta?: (meta: any) => void;
    onDelta: (delta: string) => void;
}) {
    const res = await fetch(`${API}/api/chat/stream`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${opts.token}`,
        },
        body: JSON.stringify({
            conversation_id: opts.conversationId,
            message: opts.message,
        }),
        signal: opts.signal,
    });

    if (!res.ok || !res.body) {
        throw new Error(await res.text());
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
            const lines = part.split("\n").filter(Boolean);
            const eventLine = lines.find((l) => l.startsWith("event:"));
            const dataLine = lines.find((l) => l.startsWith("data:"));
            if (!dataLine) continue;

            const jsonStr = dataLine.replace(/^data:\s*/, "");
            try {
                const payload = JSON.parse(jsonStr);

                if (eventLine?.includes("meta") && opts.onMeta) opts.onMeta(payload);
                if (payload.delta) opts.onDelta(payload.delta);
            } catch {
                // ignore
            }
        }
    }
}
