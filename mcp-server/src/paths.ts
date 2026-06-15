import { resolve, sep } from "node:path";
import { realpathSync } from "node:fs";

/**
 * slug → 파일 경로 해석 + path traversal 방어.
 *
 * 외부 에이전트가 임의 slug를 보내므로 다층 방어한다:
 *   1. 화이트리스트 정규식 (소문자-하이픈, 옵션으로 sources/ 한 단계)
 *   2. resolve 후 wiki/ 하위 prefix 검증
 *   3. realpath 로 symlink 우회 차단
 * 읽기 전용 — wiki/ 밖(raw/, CLAUDE.md, /etc/...)은 절대 해석되지 않는다.
 */

// 허용: nextjs, sources/karpathy-llm-wiki-comments, index, log
// 거부: ../, /abs, ~, 백슬래시, 다중 슬래시, sources/x/y
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)?$/;

export class InvalidSlugError extends Error {}

/** slug 에서 #anchor 를 떼고 .md 를 제거해 정규화한다. */
export function normalizeSlug(raw: string): string {
  let s = raw.trim();
  const hash = s.indexOf("#");
  if (hash !== -1) s = s.slice(0, hash);
  s = s.trim();
  if (s.endsWith(".md")) s = s.slice(0, -3);
  return s.toLowerCase();
}

/**
 * slug → 검증된 절대 파일 경로.
 * 검증 실패 시 InvalidSlugError. 파일 존재 여부는 검사하지 않는다(호출 측이 처리).
 */
export function resolvePagePath(vaultPath: string, rawSlug: string): string {
  const slug = normalizeSlug(rawSlug);

  if (!SLUG_PATTERN.test(slug)) {
    throw new InvalidSlugError(
      `invalid slug: ${JSON.stringify(rawSlug)} (allowed: lowercase-hyphen, optional "sources/" prefix)`
    );
  }

  const wikiRoot = resolve(vaultPath, "wiki");
  const target = resolve(wikiRoot, `${slug}.md`);

  // prefix 검증: 반드시 wiki/ 하위
  if (target !== wikiRoot && !target.startsWith(wikiRoot + sep)) {
    throw new InvalidSlugError(`path escapes vault: ${rawSlug}`);
  }

  // symlink 우회 차단: 파일이 존재하면 realpath 도 wiki/ 하위여야 함
  try {
    const real = realpathSync(target);
    if (real !== wikiRoot && !real.startsWith(wikiRoot + sep)) {
      throw new InvalidSlugError(`symlink escapes vault: ${rawSlug}`);
    }
  } catch (err) {
    // ENOENT(파일 없음)는 정상 — 존재 검사는 호출 측 몫. 그 외 에러만 전파.
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }

  return target;
}
