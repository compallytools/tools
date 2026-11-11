/*
 * Client HTTP pour l'API Platform de l'application.
 *
 * Authentification : uniquement la session PHP (cookie, même origine). Pas de token à gérer.
 * URLs : toujours via UX Router, ex. apiFetch(path('contrast_grid_api_ping')).
 */

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly detail: string,
        public readonly body: unknown,
    ) {
        super(`API ${status} : ${detail}`);
        this.name = 'ApiError';
    }
}

const JSON_LD = 'application/ld+json';

export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (!headers.has('Accept')) {
        headers.set('Accept', JSON_LD);
    }
    // Content-Type par défaut uniquement pour un corps JSON (string) ; FormData, Blob, URLSearchParams…
    // laissent le navigateur le définir. Un Content-Type fourni par l'appelant est toujours respecté.
    if (typeof init.body === 'string' && !headers.has('Content-Type')) {
        headers.set('Content-Type', init.method === 'PATCH' ? 'application/merge-patch+json' : JSON_LD);
    }

    const response = await fetch(url, { ...init, headers, credentials: 'same-origin' });

    if (response.status === 204) {
        return undefined as T;
    }

    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
        throw new ApiError(response.status, extractDetail(body) ?? response.statusText, body);
    }

    return body as T;
}

function extractDetail(body: unknown): string | null {
    if (typeof body !== 'object' || body === null) {
        return null;
    }
    const record = body as Record<string, unknown>;
    for (const key of ['detail', 'description', 'title', 'hydra:description']) {
        if (typeof record[key] === 'string') {
            return record[key];
        }
    }

    return null;
}
