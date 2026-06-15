import { readFileSync } from "node:fs";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  loadAllPages,
  parseIndex,
  type Page,
  type IndexEntry,
} from "./vault.js";
import { searchPages } from "./search.js";
import { extractLinkTargets, normalizeLinkTarget } from "./links.js";
import { resolvePagePath, normalizeSlug, InvalidSlugError } from "./paths.js";

type TextResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

const ok = (text: string): TextResult => ({ content: [{ type: "text", text }] });
const err = (text: string): TextResult => ({ content: [{ type: "text", text }], isError: true });

/** 입력 slug 와 가장 가까운 후보 3개(접두/부분 일치)를 제안한다. */
function suggestSlugs(pages: Page[], wanted: string): string[] {
  const w = wanted.toLowerCase();
  const scored = pages
    .filter((p) => p.slug !== "index" && p.slug !== "log")
    .map((p) => {
      const s = p.slug.toLowerCase();
      let score = 0;
      if (s.startsWith(w) || w.startsWith(s)) score = 3;
      else if (s.includes(w) || w.includes(s)) score = 2;
      else if (s.split(/[/-]/).some((part) => w.includes(part) || part.includes(w))) score = 1;
      return { slug: p.slug, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((x) => x.slug);
}

export function registerTools(server: McpServer, vaultPath: string): void {
  // ── search_wiki ──────────────────────────────────────────────
  server.registerTool(
    "search_wiki",
    {
      description:
        "위키 페이지를 키워드로 검색한다. 제목·별칭·태그·요약·본문을 가중 스코어링해 매칭 페이지 목록(슬러그·요약·스니펫)을 반환한다.",
      inputSchema: {
        query: z.string().min(1).describe("검색 키워드 (공백으로 다중 토큰 구분)"),
      },
    },
    async ({ query }): Promise<TextResult> => {
      try {
        const pages = loadAllPages(vaultPath);
        const hits = searchPages(pages, query);
        if (hits.length === 0) {
          return ok(`"${query}" 에 매칭되는 페이지가 없습니다. 더 넓은 키워드를 쓰거나 list_pages() 로 카탈로그를 확인하세요.`);
        }
        const body = hits
          .map((h) => {
            const lines = [`### ${h.slug}  (score: ${h.score})`];
            if (h.summary) lines.push(h.summary);
            if (h.snippet) lines.push(`> ${h.snippet}`);
            return lines.join("\n");
          })
          .join("\n\n");
        return ok(body);
      } catch (e) {
        return err(`search_wiki 실패: ${(e as Error).message}`);
      }
    }
  );

  // ── get_page ─────────────────────────────────────────────────
  server.registerTool(
    "get_page",
    {
      description:
        "슬러그로 위키 페이지 전체 마크다운(frontmatter 포함)을 반환한다. 소스 페이지는 'sources/슬러그' 형식.",
      inputSchema: {
        slug: z.string().min(1).describe("페이지 슬러그 (예: nextjs, sources/karpathy-llm-wiki-comments)"),
      },
    },
    async ({ slug }): Promise<TextResult> => {
      try {
        const path = resolvePagePath(vaultPath, slug);
        try {
          return ok(readFileSync(path, "utf-8"));
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code === "ENOENT") {
            const pages = loadAllPages(vaultPath);
            const suggestions = suggestSlugs(pages, normalizeSlug(slug));
            const hint = suggestions.length ? ` 혹시: ${suggestions.join(", ")}` : "";
            return err(`페이지를 찾을 수 없습니다: ${slug}.${hint}`);
          }
          throw e;
        }
      } catch (e) {
        if (e instanceof InvalidSlugError) return err(`잘못된 슬러그: ${(e as Error).message}`);
        return err(`get_page 실패: ${(e as Error).message}`);
      }
    }
  );

  // ── list_pages ───────────────────────────────────────────────
  server.registerTool(
    "list_pages",
    {
      description:
        "위키 전체 페이지 카탈로그를 카테고리별로 반환한다. index.md 기준 + 디스크 스캔으로 누락분 보강.",
      inputSchema: {},
    },
    async (): Promise<TextResult> => {
      try {
        const indexEntries: IndexEntry[] = parseIndex(vaultPath);
        const pages = loadAllPages(vaultPath);
        const known = new Set(indexEntries.map((e) => e.slug));

        // 카테고리별 그룹화 (index 순서 유지)
        const byCategory = new Map<string, { slug: string; summary: string }[]>();
        for (const e of indexEntries) {
          if (!byCategory.has(e.category)) byCategory.set(e.category, []);
          byCategory.get(e.category)!.push({ slug: e.slug, summary: e.summary });
        }

        // index 에 없는 실제 페이지를 Uncategorized 로 보강 (index/log 제외)
        const missing = pages.filter(
          (p) => p.slug !== "index" && p.slug !== "log" && !known.has(p.slug)
        );
        if (missing.length) {
          const list = missing.map((p) => ({
            slug: p.slug,
            summary: p.summary + (p.frontmatterBroken ? " (frontmatter parse failed)" : ""),
          }));
          byCategory.set("Uncategorized (index 미등록)", list);
        }

        const out: string[] = [];
        for (const [cat, items] of byCategory) {
          out.push(`## ${cat}`);
          for (const it of items) {
            out.push(`- ${it.slug}${it.summary ? ` — ${it.summary}` : ""}`);
          }
          out.push("");
        }
        return ok(out.join("\n").trim());
      } catch (e) {
        return err(`list_pages 실패: ${(e as Error).message}`);
      }
    }
  );

  // ── get_backlinks ────────────────────────────────────────────
  server.registerTool(
    "get_backlinks",
    {
      description:
        "주어진 페이지를 [[슬러그]]로 가리키는 페이지들(역링크)을 반환한다. frontmatter sources 의 인용도 포함. 위키 그래프 탐색·orphan 진단용.",
      inputSchema: {
        slug: z.string().min(1).describe("대상 페이지 슬러그"),
      },
    },
    async ({ slug }): Promise<TextResult> => {
      try {
        const target = normalizeLinkTarget(normalizeSlug(slug));
        const pages = loadAllPages(vaultPath);
        const backlinks: { slug: string; summary: string }[] = [];

        for (const page of pages) {
          if (page.slug === target) continue;
          // raw 전체(frontmatter 포함)를 스캔 → 본문 링크 + frontmatter sources 링크 모두 포착
          const targets = extractLinkTargets(page.raw);
          if (targets.has(target)) {
            backlinks.push({ slug: page.slug, summary: page.summary });
          }
        }

        if (backlinks.length === 0) {
          return ok(`"${target}" 를 가리키는 백링크가 없습니다. (orphan 가능성)`);
        }
        const body = backlinks
          .map((b) => `- ${b.slug}${b.summary ? ` — ${b.summary}` : ""}`)
          .join("\n");
        return ok(`# ${target} 백링크 (${backlinks.length})\n\n${body}`);
      } catch (e) {
        return err(`get_backlinks 실패: ${(e as Error).message}`);
      }
    }
  );
}
