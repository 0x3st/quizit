export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body?.error?.message || "Request failed");
    (err as any).status = res.status;
    (err as any).info = body;
    throw err;
  }
  const json = await res.json();
  return json.success ? json.data : json;
}
