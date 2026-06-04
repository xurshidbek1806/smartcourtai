/**
 * SmartCourt AI — backend API client.
 *
 * MVP endpoints are auth-free (under /mvp/...) so the frontend demo
 * can talk to the backend without a login flow.
 */

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const API = `${BASE_URL}/api/v1`;

export const apiBase = BASE_URL;

async function postJSON(path, body) {
  const response = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API ${response.status}: ${errorBody}`);
  }
  return response.json();
}

/**
 * MVP — ClaimValidator
 * Free-text claim → structured JSON (jurisdiction, parties, gaps, summary).
 */
export async function validateClaim(text) {
  return postJSON('/mvp/claim-validator', { text });
}

/**
 * MVP — SmartJudge (non-streaming)
 * Returns the full decision draft + cited laws + precedents.
 */
export async function smartJudge(payload) {
  return postJSON('/mvp/smart-judge', payload);
}

/**
 * MVP — SmartJudge token streaming via Server-Sent Events.
 *
 * Uses fetch + ReadableStream so we can POST a body (EventSource is GET-only).
 * Calls `onEvent(parsedJson)` for each `data: {...}` frame. The first frame is
 * `{type:'sources', laws:[...], precedents:[...]}`, then a sequence of
 * `{type:'token', content:'...'}`, ending with `{type:'done'}`.
 *
 * Returns an AbortController so callers can cancel mid-stream.
 */
export function streamSmartJudge(payload, onEvent) {
  const controller = new AbortController();

  (async () => {
    let response;
    try {
      response = await fetch(`${API}/mvp/smart-judge/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (e) {
      if (e.name !== 'AbortError') onEvent({ type: 'error', message: e.message });
      return;
    }

    if (!response.ok || !response.body) {
      onEvent({ type: 'error', message: `HTTP ${response.status}` });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line ("\n\n")
        let separator = buffer.indexOf('\n\n');
        while (separator !== -1) {
          const frame = buffer.slice(0, separator);
          buffer = buffer.slice(separator + 2);
          separator = buffer.indexOf('\n\n');

          for (const line of frame.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data) continue;
            try {
              onEvent(JSON.parse(data));
            } catch {
              // Ignore non-JSON keep-alive lines
            }
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') onEvent({ type: 'error', message: e.message });
    }
  })();

  return controller;
}
