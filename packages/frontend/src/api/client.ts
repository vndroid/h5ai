import type {
  ApiRequest,
  GetRequest,
  GetResponse,
  LoginResponse,
} from '@h5ai/types';

const API_URL = '/api';

async function post<T>(body: ApiRequest): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export function apiGet(query: Omit<GetRequest, 'action'>): Promise<GetResponse> {
  return post<GetResponse>({ action: 'get', ...query });
}

export function apiLogin(password: string): Promise<LoginResponse> {
  return post<LoginResponse>({ action: 'login', password });
}

export function apiLogout(): Promise<LoginResponse> {
  return post<LoginResponse>({ action: 'logout' });
}

/** Trigger browser download via a form POST */
export function downloadArchive(params: {
  as: string;
  type: string;
  baseHref: string;
  hrefs: string[];
}): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/api/download';
  form.style.display = 'none';

  const fields: Record<string, string> = {
    as: params.as,
    type: params.type,
    baseHref: params.baseHref,
    hrefs: params.hrefs.join('\n'),
  };

  for (const [k, v] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
