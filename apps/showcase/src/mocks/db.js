/**
 * In-memory data for the mock API. Deterministic so tests and screenshots are stable.
 * Demo credentials (fake, documented in the README): admin@example.com / demo-password.
 */

/** Common Japanese family and given names as [kanji/kana, romaji]. Names are family name first. */
const FAMILY = [
  ['佐藤', 'sato'],
  ['鈴木', 'suzuki'],
  ['高橋', 'takahashi'],
  ['田中', 'tanaka'],
  ['渡辺', 'watanabe'],
  ['伊藤', 'ito'],
  ['山本', 'yamamoto'],
  ['中村', 'nakamura'],
  ['小林', 'kobayashi'],
  ['加藤', 'kato'],
  ['吉田', 'yoshida'],
  ['山口', 'yamaguchi'],
  ['佐々木', 'sasaki'],
  ['松本', 'matsumoto'],
  ['井上', 'inoue'],
  ['木村', 'kimura'],
  ['林', 'hayashi'],
  ['清水', 'shimizu'],
  ['斎藤', 'saito'],
  ['森', 'mori'],
]
const GIVEN = [
  ['結衣', 'yui'],
  ['陽翔', 'haruto'],
  ['さくら', 'sakura'],
  ['蓮', 'ren'],
  ['美咲', 'misaki'],
  ['大翔', 'hiroto'],
  ['葵', 'aoi'],
  ['悠真', 'yuma'],
  ['陽菜', 'hina'],
  ['湊', 'minato'],
  ['凛', 'rin'],
  ['健太', 'kenta'],
  ['花子', 'hanako'],
  ['翔太', 'shota'],
  ['真央', 'mao'],
  ['拓海', 'takumi'],
  ['愛子', 'aiko'],
  ['大輝', 'daiki'],
  ['七海', 'nanami'],
  ['颯', 'hayate'],
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
      name: '山田 太郎',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      monthlyQuota: 1_000_000,
      createdAt: '2025-01-06T09:00:00.000Z',
    },
    {
      id: 'u_viewer',
      name: '鈴木 花子',
      email: 'viewer@example.com',
      role: 'viewer',
      status: 'active',
      monthlyQuota: 50_000,
      createdAt: '2025-01-07T09:00:00.000Z',
    },
  ]
  for (let i = 0; i < 55; i += 1) {
    const [family, familyRomaji] = FAMILY[Math.floor(random() * FAMILY.length)]
    const [given, givenRomaji] = GIVEN[Math.floor(random() * GIVEN.length)]
    users.push({
      id: `u_${String(i + 1).padStart(3, '0')}`,
      name: `${family} ${given}`,
      email: `${givenRomaji}.${familyRomaji}${i}@example.com`,
      role: random() > 0.85 ? 'admin' : 'viewer',
      status: STATUSES[Math.floor(random() * STATUSES.length)],
      monthlyQuota: Math.round(random() * 200) * 1000,
      createdAt: new Date(Date.UTC(2025, 0, 8) + i * 4.3 * 86_400_000).toISOString(),
    })
  }
  return users
}

export const PASSWORD = 'demo-password'

/**
 * The mock server keeps the refresh "cookie" in its own sessionStorage so a page reload keeps you
 * signed in, as a real httpOnly cookie would. This is server-side state of the fake backend:
 * application code never reads it, and the app's access token stays in memory only.
 */
const REFRESH_KEY = 'mock-api:refresh-session'

function readRefreshSession() {
  try {
    return sessionStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

/** @param {string | null} userId */
export function setRefreshSession(userId) {
  db.refreshSession = userId
  try {
    if (userId) sessionStorage.setItem(REFRESH_KEY, userId)
    else sessionStorage.removeItem(REFRESH_KEY)
  } catch {
    // Without storage the session simply ends on reload.
  }
}

export function createDb() {
  return {
    users: seedUsers(),
    /** access token → user id */
    tokens: /** @type {Map<string, string>} */ (new Map()),
    /** Stands in for the httpOnly refresh cookie: the signed-in user id, or null. */
    refreshSession: /** @type {string | null} */ (readRefreshSession()),
    failedSignIns: /** @type {Map<string, number>} */ (new Map()),
    tokenCounter: 0,
    metricsTick: 0,
  }
}

export const db = createDb()

export function resetDb() {
  setRefreshSession(null)
  Object.assign(db, createDb())
}
