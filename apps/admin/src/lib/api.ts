const base = import.meta.env.VITE_API_URL || 'http://localhost:4100';
let refresh: Promise<Response> | null = null;
export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const send = () =>
    fetch(base + path, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body && !(options.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...options.headers,
      },
    });
  let response = await send();
  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    refresh ??= fetch(base + '/auth/refresh', { method: 'POST', credentials: 'include' }).finally(
      () => {
        refresh = null;
      },
    );
    if ((await refresh).ok) response = await send();
    else window.dispatchEvent(new Event('session-expired'));
  }
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || 'So‘rov bajarilmadi');
  return body as T;
}
export const save = <T>(path: string, body: unknown, method = 'POST') =>
  api<T>(path, { method, body: JSON.stringify(body) });
