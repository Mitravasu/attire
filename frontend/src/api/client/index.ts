import { env } from "lib/env";

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const isAbsolutePath = /^https?:\/\//.test(path);
  const isAbsoluteBase = /^https?:\/\//.test(env.apiBaseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const finalUrl = isAbsolutePath
    ? new URL(path)
    : isAbsoluteBase
      ? new URL(normalizedPath, env.apiBaseUrl.endsWith("/") ? env.apiBaseUrl : `${env.apiBaseUrl}/`)
      : new URL(`${env.apiBaseUrl}${normalizedPath}`, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        finalUrl.searchParams.set(key, String(value));
      }
    });
  }

  return finalUrl.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const { query, headers, ...requestInit } = options;
  const response = await fetch(buildUrl(path, query), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...requestInit,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) {
        message = data.error;
      }
    } catch {
      // Preserve the default message when the response body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}
