

type Primitive = string | number | boolean | undefined | null;

export type HttpRequestParams = {
	url: string;
	headers?: Record<string, string>;
	query?: Record<string, Primitive | Primitive[]>;
	body?: Record<string, any>;
};

export async function GET<T>({
  url, headers, query
}: HttpRequestParams) {

  const urlWithQuery = url + (query ? `?${objectToQueryParams(query)}` : '');

  return fetch(urlWithQuery, {
    method: 'GET',
    headers
  }).then(handleResponse) as Promise<T>;
}

export function POST<T>({
  url, headers, body, query
}: HttpRequestParams) {
  return fetch(url + (query ? `?${objectToQueryParams(query)}` : ''), {
    headers: {
      ...headers,
      'Content-Type': headers?.['Content-Type'] ?? 'application/json'
    },
    body: body instanceof File ? body : typeof body === 'string' ? body : JSON.stringify(body),
    method: 'POST'
  }).then(handleResponse) as Promise<T>;
}

export function DELETE<T>({
  url, headers, body, query
}: HttpRequestParams) {
  return fetch(url + (query ? `?${objectToQueryParams(query)}` : ''), {
    headers: {
      ...headers,
      'Content-Type': headers?.['Content-Type'] ?? 'application/json'
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    method: 'DELETE'
  }).then(handleResponse) as Promise<T>;
}

export function PUT<T>({
  url,
  headers,
  body,
  query,
  skipStringify
}: {
	url: string;
	headers?: any;
	body?: any;
	query?: any;
	skipStringify?: boolean;
}): Promise<T> {
  return fetch(url + (query ? `?${objectToQueryParams(query)}` : ''), {
    headers: {
      ...headers,
      'Content-Type': headers?.['Content-Type'] ?? 'application/json'
    },
    body: body instanceof File || skipStringify ? body : typeof body !== 'object' ? body : JSON.stringify(body),
    method: 'PUT'
  }).then(handleResponse) as Promise<T>;
}

async function handleResponse(res: Response) {
  if (res.status >= 400) {
    try {
      const parsed = await res.json();

      // Rethrow parsed error to avoid catch block
      throw new Error(typeof parsed === 'object' ? JSON.stringify(parsed) : parsed);
    } catch (error: any) {
      // Only handle JSON parse errors
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse response: ${res.text()}`);
      }
      throw error;
    }
  }

  try {
    return await res.json();
  } catch {
    // If response cannot be parsed as JSON, return as text
    return res.text();
  }
}

function objectToQueryParams(data: { [key: string]: any }): string {
  return Object.keys(data)
    .filter(key => data[key] !== undefined && data[key] !== 'undefined')
    .map((key) => {
      let value = data[key];
      // Convert value to string if it's not already a string
      if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
}
