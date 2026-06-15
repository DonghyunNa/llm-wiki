/**
 * wikilink 파싱.
 *
 * `[[slug]]`, `[[slug|alias]]`, `[[slug#anchor]]`, `[[sources/slug]]` 를 모두 캡처한다.
 *   group 1 = target slug ("sources/x" 포함)
 *   group 2 = anchor (옵션, 백링크에선 무시)
 *   group 3 = alias  (옵션, 표시용)
 */
const WIKILINK = /\[\[\s*([^\]|#]+?)\s*(?:#([^\]|]+?))?\s*(?:\|([^\]]+?))?\s*\]\]/g;

/** 백링크 그래프의 노드 키로 쓸 형태로 정규화: trim → .md 제거 → 소문자. sources/ 접두사 보존. */
export function normalizeLinkTarget(target: string): string {
  let t = target.trim();
  if (t.endsWith(".md")) t = t.slice(0, -3);
  return t.toLowerCase();
}

/** 텍스트(frontmatter 포함 가능)에서 모든 wikilink target 의 정규화 집합을 추출한다. */
export function extractLinkTargets(text: string): Set<string> {
  const targets = new Set<string>();
  for (const m of text.matchAll(WIKILINK)) {
    targets.add(normalizeLinkTarget(m[1]));
  }
  return targets;
}
