/**
 * Central API client.
 *
 * All backend calls go through here so there is exactly one place that knows
 * about base URLs, headers, and token refresh. Point VITE_API_BASE_URL at the
 * backend once it exists (see .env.example). Until then every function below
 * still works against the Vite dev proxy defined in vite.config.js.
 *
 * Expected backend contract (confirm with backend teammate / adjust here only):
 *
 *  POST   /api/auth/register        { name, email, password }        -> { user, accessToken, refreshToken }
 *  POST   /api/auth/login           { email, password }               -> { user, accessToken, refreshToken }
 *  POST   /api/auth/google          { idToken }                       -> { user, accessToken, refreshToken }
 *         idToken is a Firebase/Google ID token from the frontend's Google
 *         sign-in popup. Backend verifies it server-side (never trust the
 *         frontend to mint app tokens directly from it) and upserts the user.
 *  POST   /api/auth/forgot-password { email }                         -> 204 (always, regardless of
 *                                                                         whether the email exists,
 *                                                                         to avoid account enumeration)
 *  POST   /api/auth/reset-password  { token, newPassword }            -> 204
 *  POST   /api/auth/refresh         { refreshToken }                  -> { accessToken, refreshToken }
 *  POST   /api/auth/logout          {}                                -> 204
 *  GET    /api/auth/me              (auth)                            -> { user }
 *  PATCH  /api/auth/me              (auth) { name?, email? }          -> { user }
 *
 *  POST   /api/generations          (auth, multipart: sketch, style,
 *                                    colorPalette, quality, variations) -> { generation }
 *  GET    /api/generations          (auth, ?page=&pageSize=)          -> { items: [generation], total }
 *  GET    /api/generations/:id      (auth)                            -> { generation }
 *  DELETE /api/generations/:id      (auth)                            -> 204
 *
 *  generation shape:
 *  {
 *    id, status: 'queued'|'processing'|'complete'|'failed',
 *    sketchUrl, style, colorPalette, quality,
 *    results: [{ id, imageUrl, thumbUrl }],
 *    createdAt
 *  }
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const TOKEN_KEY = 's2r_access_token'
const REFRESH_KEY = 's2r_refresh_token'

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = tokenStore.getRefresh()
  if (!refreshToken) throw new ApiError('No refresh token', 401)

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) throw new ApiError('Session expired', res.status)
        return res.json()
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  const data = await refreshPromise
  tokenStore.set(data.accessToken, data.refreshToken)
  return data.accessToken
}

/**
 * Core request helper. Automatically attaches the bearer token, retries once
 * on a 401 after refreshing, and throws ApiError with a readable message.
 */
async function request(path, { method = 'GET', body, isMultipart = false, retry = true } = {}) {
  const headers = {}
  const token = tokenStore.getAccess()
  if (token) headers.Authorization = `Bearer ${token}`
  if (!isMultipart) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && retry && tokenStore.getRefresh()) {
    try {
      await refreshAccessToken()
      return request(path, { method, body, isMultipart, retry: false })
    } catch {
      tokenStore.clear()
      throw new ApiError('Session expired, please sign in again', 401)
    }
  }

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    // no body
  }

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`
    throw new ApiError(message, res.status, data)
  }

  return data
}

export const authApi = {
  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: { name, email, password } }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  loginWithGoogle: (idToken) => request('/auth/google', { method: 'POST', body: { idToken } }),
  requestPasswordReset: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, newPassword) =>
    request('/auth/reset-password', { method: 'POST', body: { token, newPassword } }),
  me: () => request('/auth/me'),
  updateProfile: (updates) => request('/auth/me', { method: 'PATCH', body: updates }),
  logout: () => request('/auth/logout', { method: 'POST' }).catch(() => null),
}

export const generationApi = {
  create: ({ file, style, colorPalette, quality, variations }) => {
    const form = new FormData()
    form.append('sketch', file)
    form.append('style', style)
    form.append('colorPalette', colorPalette)
    form.append('quality', quality)
    form.append('variations', String(variations))
    return request('/generations', { method: 'POST', body: form, isMultipart: true })
  },
  list: (page = 1, pageSize = 12) => request(`/generations?page=${page}&pageSize=${pageSize}`),
  get: (id) => request(`/generations/${id}`),
  remove: (id) => request(`/generations/${id}`, { method: 'DELETE' }),
}

export { ApiError, API_BASE_URL }
