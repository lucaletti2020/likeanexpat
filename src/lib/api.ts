const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
};

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = auth.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    auth.clear();
    window.location.href = "/login";
  }
  return res;
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiFetch(url, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `POST ${url} failed: ${res.status}`);
  }
  return res.json();
}

export function wsUrl(path: string): string {
  const token = auth.getToken();
  const base = `ws://${window.location.hostname}:${window.location.port}`;
  return `${base}${path}${token ? `?token=${token}` : ""}`;
}
