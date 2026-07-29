import { appConfig } from '../config/appConfig'

const BASE_URL = appConfig.apiUrl
const CACHE_KEY = 'quadrilha-alunos-api-cache-v1'
const CACHE_DURATION = 5 * 60 * 1000

interface CacheEntry {
  data: unknown
  timestamp: number
}

function getCached(key: string): unknown | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}:${key}`)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(`${CACHE_KEY}:${key}`)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

function setCache(key: string, data: unknown): void {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() }
    localStorage.setItem(`${CACHE_KEY}:${key}`, JSON.stringify(entry))
  } catch {
    /* storage full */
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${BASE_URL}${path}`
  const cacheKey = url

  const cached = getCached(cacheKey)
  if (cached) return cached as T

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch(url, {
      signal: signal || controller.signal,
      headers: { Accept: 'application/json' },
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    setCache(cacheKey, data)
    return data as T
  } catch (err) {
    clearTimeout(timeout)
    const fallback = getCached(cacheKey)
    if (fallback) return fallback as T
    throw err
  }
}

export interface DashboardData {
  activeParticipants: number
  lastFinalizedSession: { id: string; date: string; status: string } | null
  lastSessionStats: { total: number; presents: number; absences: number; lates: number; justified: number } | null
  averageScore: number
  payrollStatus: string | null
  latestPublishedRanking: { month: string; year: number } | null
  rehearsalDays: string[]
  rehearsalTime: string
}

export interface PublicParticipant {
  id: string
  full_name: string
  display_name: string
  presents: number
  absences: number
  lates: number
  justifieds: number
  frequency_pct: number
}

export interface ParticipantDetail {
  participant: {
    id: string
    full_name: string
    display_name: string
    partner_name: string | null
    is_active: boolean
    joined_at: string
  }
  attendance: {
    total_sessions: number
    presents: number
    absences: number
    lates: number
    justifieds: number
    frequency_pct: number
  }
  absentDates: string[]
  evaluation: {
    id: string
    month: string
    year: number
    average: number
    level: string
    public_observation: string | null
    published_at: string
  } | null
  scores: { score: number; criterion_name: string }[]
  ranking: {
    position: number
    score: number
    average_score: number
    frequency_pct: number
    level: string
    previous_position: number | null
    position_change: number | null
  } | null
  previousEvaluation: { average: number; level: string } | null
}

export interface AttendanceData {
  sessions: { id: string; date: string }[]
  participants: PublicParticipant[]
  totalSessions: number
}

export interface EvaluationData {
  evaluations: {
    id: string
    participant_id: string
    participant_name: string
    month: string
    year: number
    average: number
    level: string
    public_observation: string | null
    published_at: string
  }[]
  criteria: { id: string; name: string; description: string; weight: number; sort_order: number }[]
}

export interface EvaluationDetail {
  id: string
  participant_id: string
  participant_name: string
  month: string
  year: number
  average: number
  level: string
  public_observation: string | null
  scores: { score: number; criterion_name: string }[]
  previousEvaluation: { average: number; level: string } | null
}

export interface RankingEntry {
  position: number
  participant_id: string
  participant_name: string
  score: number
  average_score: number
  frequency_pct: number
  level: string
  previous_position: number | null
  position_change: number | null
}

export interface RankingData {
  snapshot: { id: string; month: string; year: number; published_at: string } | null
  entries: RankingEntry[]
}

export interface PayrollStatus {
  month: string
  year: number
  status: string
  public_message: string
  expected_date: string
  signature_deadline: string
  updated_at?: string
}

export function getDashboard(signal?: AbortSignal): Promise<DashboardData> {
  return request<DashboardData>('/public/dashboard', signal)
}

export function getParticipants(month?: string, year?: number, signal?: AbortSignal): Promise<PublicParticipant[]> {
  const params = new URLSearchParams()
  if (month) params.set('month', month)
  if (year) params.set('year', String(year))
  const qs = params.toString()
  return request<PublicParticipant[]>(`/public/participants${qs ? '?' + qs : ''}`, signal)
}

export function getParticipantDetail(id: string, month?: string, year?: number, signal?: AbortSignal): Promise<ParticipantDetail> {
  const params = new URLSearchParams()
  if (month) params.set('month', month)
  if (year) params.set('year', String(year))
  const qs = params.toString()
  return request<ParticipantDetail>(`/public/participants/${id}${qs ? '?' + qs : ''}`, signal)
}

export function getAttendance(month?: string, year?: number, signal?: AbortSignal): Promise<AttendanceData> {
  const params = new URLSearchParams()
  if (month) params.set('month', month)
  if (year) params.set('year', String(year))
  const qs = params.toString()
  return request<AttendanceData>(`/public/attendance${qs ? '?' + qs : ''}`, signal)
}

export function getEvaluations(month?: string, year?: number, signal?: AbortSignal): Promise<EvaluationData> {
  const params = new URLSearchParams()
  if (month) params.set('month', month)
  if (year) params.set('year', String(year))
  const qs = params.toString()
  return request<EvaluationData>(`/public/evaluations${qs ? '?' + qs : ''}`, signal)
}

export function getEvaluationDetail(id: string, signal?: AbortSignal): Promise<EvaluationDetail> {
  return request<EvaluationDetail>(`/public/evaluations/${id}`, signal)
}

export function getRanking(month?: string, year?: number, signal?: AbortSignal): Promise<RankingData> {
  const params = new URLSearchParams()
  if (month) params.set('month', month)
  if (year) params.set('year', String(year))
  const qs = params.toString()
  return request<RankingData>(`/public/ranking${qs ? '?' + qs : ''}`, signal)
}

export function getPayrollStatus(signal?: AbortSignal): Promise<PayrollStatus> {
  return request<PayrollStatus>('/public/payroll-status', signal)
}
