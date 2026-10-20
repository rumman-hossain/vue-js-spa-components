import { http } from './client.js'

/**
 * @typedef {{ activeUsers: number, requestsToday: number, errorRate: number, p95LatencyMs: number }} Summary
 * @typedef {{ id: string, at: string, actor: string, action: string, target: string }} ActivityItem
 */

export const metricsApi = {
  /** @param {{ signal?: AbortSignal }} [options] @returns {Promise<Summary>} */
  summary: (options) => http.get('/metrics/summary', options),
  /** @param {{ signal?: AbortSignal }} [options] @returns {Promise<ActivityItem[]>} */
  activity: (options) => http.get('/metrics/activity', options),
}
