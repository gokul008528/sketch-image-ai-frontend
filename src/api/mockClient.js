/**
 * In-memory mock of the backend, used only when VITE_USE_MOCK_API=true
 * (see .env.example). Lets the frontend run and be demoed before the real
 * backend is wired up. Swap out by setting VITE_USE_MOCK_API=false once
 * the teammate's API is live — no other code needs to change.
 */

const MOCK_DELAY = 600

const SAMPLE_RESULTS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80',
  'https://images.unsplash.com/photo-1517849845537-4d257902861a?w=800&q=80',
  'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80',
]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function loadUsers() {
  return JSON.parse(localStorage.getItem('mock_users') || '[]')
}
function saveUsers(users) {
  localStorage.setItem('mock_users', JSON.stringify(users))
}
function loadGenerations() {
  return JSON.parse(localStorage.getItem('mock_generations') || '[]')
}
function saveGenerations(gens) {
  localStorage.setItem('mock_generations', JSON.stringify(gens))
}

function fakeToken(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`
}

export const mockAuthApi = {
  async register(name, email, password) {
    await delay(MOCK_DELAY)
    const users = loadUsers()
    if (users.some((u) => u.email === email)) {
      const err = new Error('An account with this email already exists')
      err.status = 409
      throw err
    }
    const user = { id: fakeToken('user'), name, email }
    users.push({ ...user, password })
    saveUsers(users)
    return { user, accessToken: fakeToken('access'), refreshToken: fakeToken('refresh') }
  },

  async login(email, password) {
    await delay(MOCK_DELAY)
    const users = loadUsers()
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) {
      const err = new Error('Incorrect email or password')
      err.status = 401
      throw err
    }
    const { password: _pw, ...user } = found
    return { user, accessToken: fakeToken('access'), refreshToken: fakeToken('refresh') }
  },

  async me() {
    await delay(200)
    const raw = localStorage.getItem('mock_current_user')
    if (!raw) {
      const err = new Error('Not authenticated')
      err.status = 401
      throw err
    }
    return { user: JSON.parse(raw) }
  },

  async logout() {
    await delay(150)
    return null
  },

  // Mock stand-in for the real backend's POST /api/auth/google.
  // Accepts a Firebase ID token payload decoded on the frontend just for the
  // mock (the real backend verifies the token server-side instead).
  async loginWithGoogle({ email, name }) {
    await delay(MOCK_DELAY)
    const users = loadUsers()
    let found = users.find((u) => u.email === email)
    if (!found) {
      found = { id: fakeToken('user'), name, email, provider: 'google' }
      users.push(found)
      saveUsers(users)
    }
    const { password: _pw, ...user } = found
    return { user, accessToken: fakeToken('access'), refreshToken: fakeToken('refresh') }
  },

  async requestPasswordReset(_email) {
    await delay(MOCK_DELAY)
    // Always resolves — the real backend does the same to avoid leaking
    // which emails have accounts.
    return null
  },

  async resetPassword(_token, _newPassword) {
    await delay(MOCK_DELAY)
    return null
  },

  async updateProfile(updates) {
    await delay(MOCK_DELAY)
    const raw = localStorage.getItem('mock_current_user')
    const current = raw ? JSON.parse(raw) : null
    if (!current) {
      const err = new Error('Not authenticated')
      err.status = 401
      throw err
    }
    const updated = { ...current, ...updates }
    localStorage.setItem('mock_current_user', JSON.stringify(updated))
    const users = loadUsers().map((u) => (u.id === updated.id ? { ...u, ...updates } : u))
    saveUsers(users)
    return { user: updated }
  },
}

export const mockGenerationApi = {
  async create({ file, style, colorPalette, quality, variations }) {
    await delay(1800)
    const gens = loadGenerations()
    const sketchUrl = URL.createObjectURL(file)
    const count = Number(variations) || 2
    const generation = {
      id: fakeToken('gen'),
      status: 'complete',
      sketchUrl,
      style,
      colorPalette,
      quality,
      createdAt: new Date().toISOString(),
      results: Array.from({ length: count }, (_, i) => ({
        id: fakeToken('res'),
        imageUrl: SAMPLE_RESULTS[(gens.length + i) % SAMPLE_RESULTS.length],
        thumbUrl: SAMPLE_RESULTS[(gens.length + i) % SAMPLE_RESULTS.length],
      })),
    }
    gens.unshift(generation)
    saveGenerations(gens)
    return { generation }
  },

  async list(page = 1, pageSize = 12) {
    await delay(300)
    const gens = loadGenerations()
    const start = (page - 1) * pageSize
    return { items: gens.slice(start, start + pageSize), total: gens.length }
  },

  async get(id) {
    await delay(200)
    const gens = loadGenerations()
    const generation = gens.find((g) => g.id === id)
    if (!generation) {
      const err = new Error('Generation not found')
      err.status = 404
      throw err
    }
    return { generation }
  },

  async remove(id) {
    await delay(200)
    const gens = loadGenerations().filter((g) => g.id !== id)
    saveGenerations(gens)
    return null
  },
}
