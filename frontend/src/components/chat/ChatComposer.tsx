"use client";

import { useState } from "react";

export default function ChatComposer({
    onSend,
    disabled,
}: {
    onSend: (text: string) => void | Promise<void>;
    disabled?: boolean;
}) {
    const [text, setText] = useState("");

    async function send() {
        const t = text.trim();
        if (!t || disabled) return;
        setText("");
        await onSend(t);
    }

    return (
        <div className="flex items-end gap-2">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message…"
                rows={2}
                className="textarea textarea-bordered w-full resize-none"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                    }
                }}
            />
            <button onClick={send} disabled={disabled} className="btn btn-primary">
                {disabled ? <span className="loading loading-spinner" /> : "Send"}
            </button>
        </div>
    );
}
