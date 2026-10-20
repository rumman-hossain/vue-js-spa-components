/**
 * In-memory data for the mock API. Deterministic so tests and screenshots are stable.
 * Demo credentials (fake, documented in the README): admin@example.com / demo-password.
 */

const FIRST = [
  'Aiko',
  'Haruto',
  'Sakura',
  'Ren',
  'Yui',
  'Sota',
  'Mei',
  'Riku',
  'Hina',
  'Kaito',
  'Emma',
  'Liam',
  'Noah',
  'Olivia',
  'Arif',
  'Nadia',
  'Tanvir',
  'Farhana',
  'Lucas',
  'Mia',
]
const LAST = [
  'Sato',
  'Suzuki',
  'Takahashi',
  'Tanaka',
  'Watanabe',
  'Ito',
  'Yamamoto',
  'Nakamura',
  'Kobayashi',
  'Kato',
  'Rahman',
  'Hossain',
  'Ahmed',
  'Smith',
  'Garcia',
  'Müller',
  'Dubois',
  'Rossi',
  'Kim',
  'Chen',
]
const STATUSES = /** @type {const} */ (['active', 'active', 'active', 'invited', 'suspended'])

/** @typedef {import('@/api/users.js').User} User */

/** Small seeded PRNG so "random" data is identical on every run. */
/** @param {number} seed */
function seeded(seed) {
  let state = seed
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648
    return state / 2_147_483_648
  }
}

function seedUsers() {
  const random = seeded(42)
  /** @type {User[]} */
  const users = [
    {
      id: 'u_admin',
      name: 'Demo Admin',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      monthlyQuota: 1_000_000,
      createdAt: '2025-01-06T09:00:00.000Z',
    },
    {
      id: 'u_viewer',
      name: 'Demo Viewer',
      email: 'viewer@example.com',
      role: 'viewer',
      status: 'active',
      monthlyQuota: 50_000,
      createdAt: '2025-01-07T09:00:00.000Z',
    },
  ]
  for (let i = 0; i < 55; i += 1) {
    const first = FIRST[Math.floor(random() * FIRST.length)]
    const last = LAST[Math.floor(random() * LAST.length)]
    users.push({
      id: `u_${String(i + 1).padStart(3, '0')}`,
      name: `${first} ${last}`,
      email: `${first}.${last}${i}@example.com`.toLowerCase().replace('ü', 'u'),
      role: random() > 0.85 ? 'admin' : 'viewer',
      status: STATUSES[Math.floor(random() * STATUSES.length)],
      monthlyQuota: Math.round(random() * 200) * 1000,
      createdAt: new Date(Date.UTC(2025, 0, 8) + i * 4.3 * 86_400_000).toISOString(),
    })
  }
  return users
}

export const PASSWORD = 'demo-password'

export function createDb() {
  return {
    users: seedUsers(),
    /** access token → user id */
    tokens: /** @type {Map<string, string>} */ (new Map()),
    /** Stands in for the httpOnly refresh cookie: the signed-in user id, or null. */
    refreshSession: /** @type {string | null} */ (null),
    failedSignIns: /** @type {Map<string, number>} */ (new Map()),
    tokenCounter: 0,
    metricsTick: 0,
  }
}

export const db = createDb()

export function resetDb() {
  Object.assign(db, createDb())
}
