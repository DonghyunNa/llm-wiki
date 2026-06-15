import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

/** 한 위키 페이지를 메모리에 로드한 형태. */
export interface Page {
  /** 정규화 slug. 루트는 "nextjs", 소스는 "sources/karpathy-...". */
  slug: string;
  /** 절대 파일 경로. */
  path: string;
  /** frontmatter(파싱 실패 시 빈 객체). */
  frontmatter: Record<string, unknown>;
  /** frontmatter 를 제외한 본문. */
  body: string;
  /** 파일 raw 전체(frontmatter 포함). */
  raw: string;
  /** 한 줄 요약 (summary 콜아웃 → 첫 헤딩 순). */
  summary: string;
  /** frontmatter 가 깨져 degrade 된 경우 true. */
  frontmatterBroken: boolean;
}

/**
 * vault 경로 해석: --vault 인자 > WIKI_VAULT_PATH env > 서버 파일 기준 기본값.
 * 기본값은 mcp-server/ 의 부모 = vault 루트.
 */
export function resolveVaultPath(argv: string[]): string {
  const flagIdx = argv.indexOf("--vault");
  if (flagIdx !== -1 && argv[flagIdx + 1]) {
    return resolve(argv[flagIdx + 1]);
  }
  if (process.env.WIKI_VAULT_PATH) {
    return resolve(process.env.WIKI_VAULT_PATH);
  }
  const here = dirname(fileURLToPath(import.meta.url)); // mcp-server/src
  return resolve(here, "..", "..");
}

/** 부팅 시 vault 가 유효한지 확인. 실패 시 throw. */
export function assertVault(vaultPath: string): void {
  const indexFile = join(vaultPath, "wiki", "index.md");
  if (!existsSync(indexFile)) {
    throw new Error(
      `vault not found: ${indexFile} 가 없습니다. --vault 또는 WIKI_VAULT_PATH 로 올바른 경로를 지정하세요.`
    );
  }
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;
// "> [!summary]" 또는 "> [!summary] 한 줄 요약" 다음 줄(들)의 "> ..." 본문
const SUMMARY_CALLOUT = /^>\s*\[!summary\][^\n]*\n((?:>.*\n?)*)/im;

function extractSummary(body: string): string {
  const m = body.match(SUMMARY_CALLOUT);
  if (m) {
    const text = m[1]
      .split("\n")
      .map((l) => l.replace(/^>\s?/, "").trim())
      .filter(Boolean)
      .join(" ");
    if (text) return text;
  }
  // 폴백: 첫 "# 헤딩"
  const heading = body.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : "";
}

function parsePage(slug: string, path: string): Page {
  const raw = readFileSync(path, "utf-8");
  const fmMatch = raw.match(FRONTMATTER);
  let frontmatter: Record<string, unknown> = {};
  let frontmatterBroken = false;
  let body = raw;

  if (fmMatch) {
    body = raw.slice(fmMatch[0].length);
    try {
      const parsed = parseYaml(fmMatch[1]);
      frontmatter = parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      frontmatterBroken = true; // 드롭하지 않고 degrade
    }
  }

  return {
    slug,
    path,
    frontmatter,
    body,
    raw,
    summary: extractSummary(body),
    frontmatterBroken,
  };
}

/** wiki/ 와 wiki/sources/ 의 모든 .md 페이지를 로드한다. index/log 포함. */
export function loadAllPages(vaultPath: string): Page[] {
  const wikiDir = join(vaultPath, "wiki");
  const pages: Page[] = [];

  for (const f of readdirSync(wikiDir)) {
    if (f.endsWith(".md")) {
      pages.push(parsePage(f.slice(0, -3).toLowerCase(), join(wikiDir, f)));
    }
  }

  const sourcesDir = join(wikiDir, "sources");
  if (existsSync(sourcesDir)) {
    for (const f of readdirSync(sourcesDir)) {
      if (f.endsWith(".md")) {
        const slug = `sources/${f.slice(0, -3).toLowerCase()}`;
        pages.push(parsePage(slug, join(sourcesDir, f)));
      }
    }
  }

  return pages;
}

/** index.md 의 "## 카테고리" / "- [[slug]] — 요약" 구조를 파싱한다. */
export interface IndexEntry {
  category: string;
  slug: string;
  summary: string;
}

export function parseIndex(vaultPath: string): IndexEntry[] {
  const indexPath = join(vaultPath, "wiki", "index.md");
  const text = readFileSync(indexPath, "utf-8");
  const entries: IndexEntry[] = [];
  let category = "Uncategorized";

  for (const line of text.split("\n")) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      category = h[1].trim();
      continue;
    }
    // - [[slug]] — 요약   또는   - [[slug|표시]] — 요약
    const item = line.match(/^-\s*\[\[\s*([^\]|#]+?)\s*(?:\|[^\]]+?)?\s*\]\]\s*(?:[—–-]\s*(.*))?$/);
    if (item) {
      entries.push({
        category,
        slug: item[1].trim().toLowerCase(),
        summary: (item[2] ?? "").trim(),
      });
    }
  }
  return entries;
}
