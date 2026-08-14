// Every call to the backend goes through this file.
// It adds the login token and turns errors into readable messages.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "mj_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    // The fetch itself failed, so the backend is not running or the wifi is gone.
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  // 204 means "done, nothing to send back" (used after deleting).
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Our token is gone or expired: send the user back to the login screen.
    if (response.status === 401 && token) {
      clearToken();
      window.location.href = "/login";
    }
    throw new Error(data?.message ?? "Something went wrong");
  }

  return data as T;
}
