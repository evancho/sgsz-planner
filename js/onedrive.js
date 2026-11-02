import { PublicClientApplication, InteractionRequiredAuthError } from 'https://cdn.jsdelivr.net/npm/@azure/msal-browser@3.28.1/+esm';
import { backupFileName, clientId, loginRequest } from './onedrive-config.js';

const GRAPH = 'https://graph.microsoft.com/v1.0';
const PLACEHOLDER_IDS = new Set(['', 'YOUR_AZURE_SPA_CLIENT_ID']);

let pca = null;
let initPromise = null;

function redirectUri() {
  return new URL('.', window.location.href).href;
}

export function isConfigured() {
  return Boolean(clientId) && !PLACEHOLDER_IDS.has(String(clientId).trim());
}

export function getAccount() {
  if (!pca) return null;
  const accounts = pca.getAllAccounts();
  return accounts[0] || null;
}

export function displayName() {
  const account = getAccount();
  if (!account) return '';
  return account.name || account.username || '';
}

export async function initOneDrive() {
  if (!isConfigured()) return { ok: false, reason: 'unconfigured' };
  if (!initPromise) {
    initPromise = (async () => {
      pca = new PublicClientApplication({
        auth: {
          clientId: String(clientId).trim(),
          authority: 'https://login.microsoftonline.com/consumers',
          redirectUri: redirectUri(),
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: false,
        },
      });
      await pca.initialize();
      await pca.handleRedirectPromise();
      return { ok: true };
    })().catch((error) => {
      initPromise = null;
      pca = null;
      return { ok: false, reason: 'init-failed', error };
    });
  }
  return initPromise;
}

async function token() {
  const ready = await initOneDrive();
  if (!ready.ok) throw new Error(ready.reason === 'unconfigured' ? '尚未設定 OneDrive' : 'OneDrive 初始化失敗');
  const account = getAccount();
  if (!account) throw new Error('not-signed-in');
  try {
    const result = await pca.acquireTokenSilent({ ...loginRequest, account });
    return result.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await pca.acquireTokenRedirect(loginRequest);
      return null;
    }
    throw error;
  }
}

export async function signIn() {
  const ready = await initOneDrive();
  if (!ready.ok) {
    return { ok: false, error: ready.reason === 'unconfigured' ? '請先在 onedrive-config.js 填入 Azure client ID' : 'OneDrive 初始化失敗' };
  }
  if (getAccount()) return { ok: true, account: displayName() };
  try {
    await pca.loginRedirect(loginRequest);
    return { ok: true, redirect: true };
  } catch (error) {
    return { ok: false, error: error?.message || '登入失敗' };
  }
}

export async function signOut() {
  const ready = await initOneDrive();
  if (!ready.ok || !pca) return;
  const account = getAccount();
  if (!account) return;
  await pca.logoutRedirect({ account });
}

async function graph(path, { method = 'GET', body, token: accessToken } = {}) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  let payload = body;
  if (body != null && typeof body !== 'string') {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  } else if (typeof body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(`${GRAPH}${path}`, { method, headers, body: payload });
  return response;
}

function contentPath() {
  return `/me/drive/special/approot:/${backupFileName}:/content`;
}

/** @returns {Promise<{ ok: true, payload: object|null } | { ok: false, error: string }>} */
export async function downloadBackup() {
  try {
    const accessToken = await token();
    if (!accessToken) return { ok: true, pending: true };
    const response = await graph(contentPath(), { token: accessToken });
    if (response.status === 404) return { ok: true, payload: null };
    if (!response.ok) {
      return { ok: false, error: `下載失敗（${response.status}）` };
    }
    const payload = await response.json();
    return { ok: true, payload };
  } catch (error) {
    if (error?.message === 'not-signed-in') return { ok: false, error: '尚未連接 OneDrive' };
    return { ok: false, error: error?.message || '下載失敗' };
  }
}

/** @returns {Promise<{ ok: true } | { ok: false, error: string }>} */
export async function uploadBackup(payload) {
  try {
    const accessToken = await token();
    if (!accessToken) return { ok: true, pending: true };
    const response = await graph(contentPath(), {
      method: 'PUT',
      token: accessToken,
      body: payload,
    });
    if (!response.ok) {
      return { ok: false, error: `上傳失敗（${response.status}）` };
    }
    return { ok: true };
  } catch (error) {
    if (error?.message === 'not-signed-in') return { ok: false, error: '尚未連接 OneDrive' };
    return { ok: false, error: error?.message || '上傳失敗' };
  }
}
