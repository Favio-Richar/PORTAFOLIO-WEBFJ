const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const withAuthHeaders = (headers?: HeadersInit): Headers => {
  const merged = new Headers(headers || {});
  const token = getAuthToken();
  if (token) merged.set("Authorization", `Bearer ${token}`);
  return merged;
};

export const adminFetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
  let url = input;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  if (typeof input === "string" && input.startsWith("/api")) {
    url = `${backendUrl}${input}`;
  }

  const headers = withAuthHeaders(init.headers);
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...init,
    credentials: "include",
    headers,
  });
};
