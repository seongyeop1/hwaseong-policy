/**
 * POST /evaluate 클라이언트.
 * 폼 값 → API 요청 변환 + fetch 래핑.
 * API URL은 NEXT_PUBLIC_API_BASE_URL 환경변수에서 읽는다 (.env.example 참조).
 */

import type { Profile as FormProfile } from '@/app/components/ProfileForm';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// 페르소나 A 촬영용 고정 기준일 — /analysis?as_of=2026-06-01 쿼리로 전달 (docs/demo-scenarios.md)
// 기본(쿼리 없음)은 as_of 미전송 → 서버가 오늘 기준으로 판정 (#65 페르소나 D 라이브 방침)
export const DEMO_AS_OF = '2026-06-01';

/* ── 응답 타입 (api-contract.md v1.1.4 기준) ────────────────────────── */

export type VerifyItem = { key: string | null; label: string; hint: string };

export type ApiPolicy = {
  policy_id: string;
  title: string;
  category: string;
  lifecycle: string[];
  beneficiary: string;
  benefit: string;
  conditions: Record<string, unknown>;
  verify_required: VerifyItem[];
  exclusions: string[];
  deadline: string | null;
  apply_channel: string;
  required_docs: string[];
  source_url: string;
  contact: string | null;
  first_seen: string | null;
  is_new: boolean;
};

export type EligibleItem   = { for_member: string; policy: ApiPolicy; reasons: string[]; ai_summary: string | null };
export type DocsNeededItem = { for_member: string; policy: ApiPolicy; reasons: string[]; verify: VerifyItem[]; ai_summary: string | null };
export type UpcomingItem   = { for_member: string; policy: ApiPolicy; reasons: string[]; waiting_for: string; d_day: number; expected_date: string; verify: VerifyItem[]; ai_summary: string | null };

export type EvaluateResponse = {
  as_of: string;
  results: {
    eligible: EligibleItem[];
    docs_needed: DocsNeededItem[];
    upcoming: UpcomingItem[];
  };
};

/* ── 공개 API ─────────────────────────────────────────────────────── */

/** API URL이 설정되지 않은 경우 (로컬 개발 등) true */
export function isApiUnavailable() {
  return !API_BASE;
}

export async function evaluate(
  form: FormProfile,
  asOf?: string,
  overrides?: Record<string, unknown>,
): Promise<EvaluateResponse> {
  if (!API_BASE) throw new Error('NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다');

  const body = {
    birth_date:     form.birth_date,
    move_in_date:   form.move_in_date,
    region:         form.region,
    household_type: form.household_type,
    lifecycle:      form.lifecycle,
    members:        [{ relation: '본인', birth_date: form.birth_date }],
    ...(asOf ? { as_of: asOf } : {}),
    ...(overrides ? { overrides } : {}),
  };

  const res = await fetch(`${API_BASE}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(payload?.error?.message ?? `서버 오류 (${res.status})`);
  }

  return res.json() as Promise<EvaluateResponse>;
}
