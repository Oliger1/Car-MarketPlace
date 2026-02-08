import type { ApiError } from "@/types/api";

async function parseMaybeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await res.json();
  return await res.text();
}

export async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...opts,
    headers: {
      "content-type": "application/json",
      ...(opts.headers || {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await parseMaybeJson(res);
    const err: ApiError = {
      status: res.status,
      message: typeof body === "string" ? body : (body?.detail?.[0]?.msg ?? body?.message ?? "Request failed"),
      detail: body,
    };
    throw err;
  }

  return (await parseMaybeJson(res)) as T;
}
