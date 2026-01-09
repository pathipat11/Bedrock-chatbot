export type Me = {
    id: string;
    email: string;
    username: string;
};

export function setToken(token: string) {
    localStorage.setItem("access_token", token);
}

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
}
export function clearToken() {
    localStorage.removeItem("access_token");
}
