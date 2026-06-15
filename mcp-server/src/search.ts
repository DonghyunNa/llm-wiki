import type { Page } from "./vault.js";

/** 검색 결과 한 건. */
export interface SearchHit {
  slug: string;
  score: number;
  summary: string;
  snippet: string;
}

/** 필드 가중치. slug/제목이 가장 강하고 본문이 가장 약하다. */
const WEIGHT = { slug: 5, alias: 4, tag: 3, summary: 2, body: 1 } as const;
const BODY_HITS_CAP = 3; // 토큰당 본문 매칭 점수 상한
const ALL_TOKENS_BONUS = 2;

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).toLowerCase());
  if (typeof v === "string") return [v.toLowerCase()];
  return [];
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) {
    count++;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return count;
}

function makeSnippet(body: string, token: string): string {
  const lower = body.toLowerCase();
  const i = lower.indexOf(token);
  if (i === -1) return "";
  const start = Math.max(0, i - 60);
  const end = Math.min(body.length, i + token.length + 60);
  let snip = body.slice(start, end).replace(/\s+/g, " ").trim();
  // 매칭어 강조 (대소문자 보존)
  const re = new RegExp(`(${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  snip = snip.replace(re, "**$1**");
  if (start > 0) snip = "…" + snip;
  if (end < body.length) snip = snip + "…";
  return snip;
}

/** 페이지 집합을 query 로 키워드 검색. 점수 내림차순 상위 limit 개. */
export function searchPages(pages: Page[], query: string, limit = 10): SearchHit[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const hits: SearchHit[] = [];

  for (const page of pages) {
    // index/log 는 검색 대상에서 제외 (페이지가 아니라 메타)
    if (page.slug === "index" || page.slug === "log") continue;

    const titleMatch = page.body.match(/^#\s+(.+)$/m);
    const title = (titleMatch?.[1] ?? "").toLowerCase();
    const aliases = asStringArray(page.frontmatter.aliases);
    const tags = asStringArray(page.frontmatter.tags);
    const summaryLower = page.summary.toLowerCase();
    const bodyLower = page.body.toLowerCase();
    const slugLower = page.slug.toLowerCase();

    let score = 0;
    let matchedTokens = 0;
    let snippet = "";

    for (const tok of tokens) {
      let tokenHit = false;

      if (slugLower.includes(tok) || title.includes(tok)) {
        score += WEIGHT.slug;
        tokenHit = true;
      }
      if (aliases.some((a) => a.includes(tok))) {
        score += WEIGHT.alias;
        tokenHit = true;
      }
      if (tags.some((t) => t.includes(tok))) {
        score += WEIGHT.tag;
        tokenHit = true;
      }
      if (summaryLower.includes(tok)) {
        score += WEIGHT.summary;
        tokenHit = true;
      }
      const bodyHits = Math.min(countOccurrences(bodyLower, tok), BODY_HITS_CAP);
      if (bodyHits > 0) {
        score += WEIGHT.body * bodyHits;
        tokenHit = true;
        if (!snippet) snippet = makeSnippet(page.body, tok);
      }

      if (tokenHit) matchedTokens++;
    }

    if (score === 0) continue;
    if (matchedTokens === tokens.length && tokens.length > 1) score += ALL_TOKENS_BONUS;

    hits.push({ slug: page.slug, score, summary: page.summary, snippet });
  }

  hits.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));
  return hits.slice(0, limit);
}
