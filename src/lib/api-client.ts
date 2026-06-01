export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, body.error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(url: string) => request<T>(url),

  post: <T>(url: string, data: unknown) =>
    request<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(url: string, data: unknown) =>
    request<T>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T>(url: string, data: unknown) =>
    request<T>(url, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
