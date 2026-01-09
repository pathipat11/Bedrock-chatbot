/* eslint-disable @typescript-eslint/no-explicit-any */
const API = process.env.NEXT_PUBLIC_API_BASE!;

export async function apiGet(path: string, token?: string | null) {
    const res = await fetch(`${API}${path}`, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function apiPost(path: string, body: any, token?: string | null) {
    const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}