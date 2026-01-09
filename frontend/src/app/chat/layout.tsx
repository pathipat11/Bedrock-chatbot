import type { ReactNode } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";

export default function ChatLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-[calc(100vh-56px)] bg-base-200">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 p-4 md:grid-cols-[320px_1fr]">
                <aside className="card bg-base-100 shadow md:h-[calc(100vh-56px-32px)]">
                    <div className="h-full">
                        <ChatSidebar />
                    </div>
                </aside>

                <main className="card bg-base-100 shadow md:h-[calc(100vh-56px-32px)]">
                    <div className="h-full">{children}</div>
                </main>
            </div>
        </div>
    );
}
