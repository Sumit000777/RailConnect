/**
 * api.js
 * Shared helpers used by every page: talking to the backend API,
 * reading/writing the logged-in user, and guarding protected pages.
 */
const RMS = (function () {
  const API_BASE = ""; // same origin — server.js serves frontend + API together
  const TOKEN_KEY = "rms_token";
  const USER_KEY = "rms_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Wraps fetch(): sends JSON, attaches the auth token if present,
   * and always returns { ok, status, data }.
   */
  async function api(path, { method = "GET", body, auth = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    let res, data;
    try {
      res = await fetch(API_BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      data = await res.json().catch(() => ({}));
    } catch (err) {
      return { ok: false, status: 0, data: { message: "Could not reach the server. Is it running?" } };
    }

    if (res.status === 401 && auth) {
      clearSession();
    }

    return { ok: res.ok, status: res.status, data };
  }

  /** Call at the top of any page that requires login. Redirects if not logged in. */
  function requireLogin() {
    if (!getToken()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  function logout() {
    clearSession();
    window.location.href = "index.html";
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }

  function formatDateTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  return { api, getToken, getUser, setSession, clearSession, requireLogin, logout, formatDate, formatDateTime, qs };
})();
