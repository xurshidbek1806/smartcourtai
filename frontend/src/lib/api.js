/**
 * SmartCourt AI — backend API client.
 *
 * Full client with JWT auth. The demo auto-logs-in a role-appropriate
 * seeded user (parol: Demo1234!) so every authenticated endpoint works
 * without a manual login screen.
 */

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const API = `${BASE_URL}/api/v1`;
const WS_BASE = BASE_URL.replace(/^http/, 'ws');

export const apiBase = BASE_URL;
export const wsBase = WS_BASE;

// ── Token storage ───────────────────────────────────────────
const TOKEN_KEY = 'smartcourt-token';
const USER_KEY = 'smartcourt-user';

export const getToken = () => window.localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => window.localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
};
export const getUser = () => {
  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};
const setUser = (u) => window.localStorage.setItem(USER_KEY, JSON.stringify(u));

// ── Core request helper ─────────────────────────────────────
function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

async function request(path, { method = 'GET', body, headers = {}, raw = false } = {}) {
  const opts = { method, headers: authHeaders(headers) };
  if (body !== undefined) {
    if (body instanceof FormData) {
      opts.body = body; // browser sets multipart boundary
    } else {
      opts.headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...opts.headers };
      opts.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`${API}${path}`, opts);
  if (res.status === 401) {
    clearToken();
  }
  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.json()).detail || '';
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new Error(detail || `API ${res.status}`);
  }
  if (raw) return res;
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────
const DEMO_USERS = {
  citizen: { email: 'fuqaro@smartcourt.uz', password: 'Demo1234!' },
  judge: { email: 'sudya@smartcourt.uz', password: 'Demo1234!' },
  lawyer: { email: 'advokat@smartcourt.uz', password: 'Demo1234!' },
  admin: { email: 'admin@smartcourt.uz', password: 'Demo1234!' },
  oversight: { email: 'nazorat@smartcourt.uz', password: 'Demo1234!' }
};

export async function login(email, password) {
  const data = await request('/auth/login', { method: 'POST', body: { email, password } });
  setToken(data.access_token);
  setUser({ id: data.user_id, role: data.role, full_name: data.full_name });
  return data;
}

export async function register(payload) {
  const data = await request('/auth/register', { method: 'POST', body: payload });
  setToken(data.access_token);
  setUser({ id: data.user_id, role: data.role, full_name: data.full_name });
  return data;
}

export async function fetchMe() {
  return request('/auth/me');
}

/** Map a route prefix to the seeded demo role. */
export function roleForPath(path = '') {
  if (path.includes('/judge')) return 'judge';
  if (path.includes('/admin')) return 'admin';
  if (path.includes('/oversight')) return 'oversight';
  return 'citizen';
}

/**
 * Ensure a JWT exists for the given role. If the current token is for a
 * different role (or missing), log in as the seeded demo user so every
 * authenticated endpoint just works in the demo.
 */
export async function ensureAuth(role = 'citizen') {
  const current = getUser();
  if (getToken() && current?.role === role) return current;
  const creds = DEMO_USERS[role] || DEMO_USERS.citizen;
  try {
    await login(creds.email, creds.password);
    return getUser();
  } catch (e) {
    // backend down or not seeded — surface but don't crash the page
    console.warn('[api] demo auth failed:', e.message);
    return null;
  }
}

export function logout() {
  clearToken();
}

// ── System ──────────────────────────────────────────────────
export const getSystemStatus = () => request('/system/status');

// ── Dashboards ──────────────────────────────────────────────
export const getCitizenDashboard = () => request('/dashboard/citizen');
export const getJudgeDashboard = () => request('/dashboard/judge');

// ── Claims ──────────────────────────────────────────────────
export const listClaims = () => request('/claims');
export const getClaim = (id) => request(`/claims/${id}`);
export const createClaim = (payload) => request('/claims', { method: 'POST', body: payload });
export const updateClaim = (id, payload) => request(`/claims/${id}`, { method: 'PATCH', body: payload });
export const submitClaim = (id) => request(`/claims/${id}/submit`, { method: 'POST' });
export const deleteClaim = (id) => request(`/claims/${id}`, { method: 'DELETE' });

// ── Cases ───────────────────────────────────────────────────
export const listCases = (status) => request(`/cases${status ? `?status=${status}` : ''}`);
export const getCase = (id) => request(`/cases/${id}`);
export const openCaseFromClaim = (payload) => request('/cases/from-claim', { method: 'POST', body: payload });
export const signDecision = (id, decision_text) =>
  request(`/cases/${id}/sign`, { method: 'POST', body: { decision_text } });

// ── Notifications ───────────────────────────────────────────
export const listNotifications = () => request('/notifications');
export const unreadCount = () => request('/notifications/unread-count');
export const markNotificationRead = (id) => request(`/notifications/${id}/read`, { method: 'POST' });

// ── Documents / evidence ────────────────────────────────────
export function uploadDocument(file, { claimId, caseId, analyze = true } = {}) {
  const fd = new FormData();
  fd.append('file', file);
  if (claimId != null) fd.append('claim_id', String(claimId));
  if (caseId != null) fd.append('case_id', String(caseId));
  fd.append('analyze', String(analyze));
  return request('/documents/upload', { method: 'POST', body: fd });
}
export const listClaimDocuments = (claimId) => request(`/documents/claim/${claimId}`);

// ── Laws & precedents (legal corpus) ────────────────────────
export const searchLaws = (q, limit = 20) =>
  request(`/laws${q ? `?q=${encodeURIComponent(q)}&limit=${limit}` : `?limit=${limit}`}`);
export const searchPrecedents = (q, limit = 20) =>
  request(`/precedents${q ? `?q=${encodeURIComponent(q)}&limit=${limit}` : `?limit=${limit}`}`);
export const listLawPdfs = () => request('/laws/pdfs');
export const lawPdfUrl = (name) => `${API}/laws/pdfs/${encodeURIComponent(name)}`;

// ── Admin ───────────────────────────────────────────────────
export const adminListUsers = (role) => request(`/admin/users${role ? `?role=${role}` : ''}`);
export const adminStats = () => request('/admin/stats');
export const adminAuditLog = (limit = 100) => request(`/admin/audit-log?limit=${limit}`);
export const adminAiModels = () => request('/admin/ai-models');

// ── RAG corpus (admin) ──────────────────────────────────────
export const corpusStats = () => request('/admin/corpus/stats');
export const corpusClear = (collection) =>
  request('/admin/corpus/clear', { method: 'POST', body: { collection } });
export const corpusSearch = (q, collection = 'laws', limit = 5) =>
  request(`/admin/corpus/search?q=${encodeURIComponent(q)}&collection=${collection}&limit=${limit}`);

export function corpusUpload(file, { collection = 'laws', code = '', mode = 'auto' } = {}) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('collection', collection);
  fd.append('code', code);
  fd.append('mode', mode);
  return request('/admin/corpus/upload', { method: 'POST', body: fd });
}

// ── AI modules (require auth — ensureAuth handles demo login) ─
export const aiClaimValidator = (text) => request('/ai/claim-validator', { method: 'POST', body: { text } });
export const aiMediatoBot = (payload) => request('/ai/mediato-bot', { method: 'POST', body: payload });
export const aiLexPredictor = (payload) => request('/ai/lex-predictor', { method: 'POST', body: payload });
export const aiEvidenceText = (text) => request('/ai/evidence-analyzer/text', { method: 'POST', body: { text } });
export const aiSentencAi = (payload) => request('/ai/sentenc-ai', { method: 'POST', body: payload });
export const aiAnonimusLaw = (text, use_llm = false) =>
  request('/ai/anonimus-law', { method: 'POST', body: { text, use_llm } });
export const aiCorruptCheck = (payload) => request('/ai/corrupt-alert/check', { method: 'POST', body: payload });
export const aiCorruptRelation = (payload) => request('/ai/corrupt-alert/relation', { method: 'POST', body: payload });
export const aiAutoExec = (caseId) => request(`/ai/auto-exec/${caseId}`, { method: 'POST' });
export const aiSmartJudge = (payload) => request('/ai/smart-judge', { method: 'POST', body: payload });

// Public (auth-free) MVP variants
export async function validateClaim(text) {
  return request('/mvp/claim-validator', { method: 'POST', body: { text } });
}
export async function smartJudge(payload) {
  return request('/mvp/smart-judge', { method: 'POST', body: payload });
}

// ── SSE streaming helper ────────────────────────────────────
/**
 * POST a JSON body and read a Server-Sent-Events stream, invoking
 * onEvent(parsedJson) per `data:` frame. Returns an AbortController.
 */
export function streamSSE(path, payload, onEvent, { auth = false } = {}) {
  const controller = new AbortController();
  (async () => {
    let response;
    try {
      const headers = { 'Content-Type': 'application/json', Accept: 'text/event-stream' };
      response = await fetch(`${API}${path}`, {
        method: 'POST',
        headers: auth ? authHeaders(headers) : headers,
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
        let sep = buffer.indexOf('\n\n');
        while (sep !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          sep = buffer.indexOf('\n\n');
          for (const line of frame.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data) continue;
            try {
              onEvent(JSON.parse(data));
            } catch {
              /* ignore keep-alive */
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

// SmartJudge token streaming (auth-free MVP endpoint)
export function streamSmartJudge(payload, onEvent) {
  return streamSSE('/mvp/smart-judge/stream', payload, onEvent);
}

// AI legal assistant streaming (auth required)
export function streamAssistant(payload, onEvent) {
  return streamSSE('/ai/assistant/stream', payload, onEvent, { auth: true });
}
