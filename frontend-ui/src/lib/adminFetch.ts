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
  return fetch(input, {
    ...init,
    headers: withAuthHeaders(init.headers),
  });
};
