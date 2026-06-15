# llm-wiki MCP 서버

이 vault를 **읽기 전용 MCP 서버**로 노출해, 다른 프로젝트의 Claude Code 세션·에이전트가 위키 지식을 도구로 조회하게 한다.

> 쓰기(ingest/query/lint)는 llm-wiki 하네스(`.claude/`)가 담당한다. 이 서버는 **조회 전용** — vault를 절대 수정하지 않는다.

## 노출하는 tool

| tool | 설명 |
|------|------|
| `search_wiki(query)` | 제목·별칭·태그·요약·본문을 가중 스코어링해 매칭 페이지(슬러그·요약·스니펫)를 반환 |
| `get_page(slug)` | 슬러그로 페이지 전체 마크다운 반환 (소스는 `sources/슬러그`) |
| `list_pages()` | index.md 기준 카테고리별 카탈로그 (+디스크 스캔으로 누락 보강) |
| `get_backlinks(slug)` | 해당 페이지를 `[[슬러그]]`로 가리키는 페이지들 (그래프 탐색·orphan 진단) |

## 설치

```bash
cd mcp-server
npm install
```

빌드 단계는 없다 — `tsx`로 TypeScript를 바로 실행한다.

## 연결

### A. claude mcp add (권장)

```bash
claude mcp add llm-wiki --scope user -- \
  npx tsx /절대경로/llm-wiki/mcp-server/src/index.ts
```

### B. 임의 프로젝트의 `.mcp.json`

```json
{
  "mcpServers": {
    "llm-wiki": {
      "command": "npx",
      "args": ["tsx", "/절대경로/llm-wiki/mcp-server/src/index.ts"],
      "env": { "WIKI_VAULT_PATH": "/절대경로/llm-wiki" }
    }
  }
}
```

연결 후 다른 세션에서 `mcp__llm-wiki__search_wiki` 등으로 호출된다.

### 다른 vault 가리키기

경로 해석 우선순위: `--vault <path>` 인자 > `WIKI_VAULT_PATH` 환경변수 > 기본값(`mcp-server/`의 부모 디렉토리).

## 보안

외부 에이전트가 임의 슬러그를 보내므로 `src/paths.ts`에서 다층 방어한다:

1. 슬러그 화이트리스트 정규식 (소문자-하이픈, 옵션 `sources/` 한 단계)
2. `resolve` 후 `wiki/` 하위 prefix 검증
3. `realpath`로 symlink 우회 차단
4. 읽기 전용 (`fs.readFile`만 사용)

`../../etc/passwd`, `/etc/passwd`, `sources/../../CLAUDE`, symlink 우회는 모두 거부된다. `raw/`·`CLAUDE.md` 등 `wiki/` 밖은 노출되지 않는다.

## 검증

```bash
# MCP Inspector (GUI)
npm run inspect

# 타입 체크
npm run typecheck
```

Inspector에서 확인할 것:
- `list_pages()` → 카테고리별 카탈로그
- `search_wiki("RAG")` → `context-vs-rag` 최상위
- `get_page("nextjs")`, `get_page("sources/karpathy-llm-wiki-comments")` → 전체 마크다운
- `get_backlinks("llm-wiki-pattern")` → 인용 페이지 목록
- 보안: `get_page("../../etc/passwd")` → 거부 (`isError`)

## 구조

```
src/
├── index.ts   # McpServer + stdio transport, tool 등록
├── paths.ts   # slug→경로 해석 + path traversal 방어
├── links.ts   # wikilink 파싱 + 백링크 키 정규화
├── vault.ts   # 파일 스캔, frontmatter/summary 파싱, vault 경로 해석
├── search.ts  # 키워드 스코어링 + 스니펫
└── tools.ts   # 4개 tool의 zod 스키마 + 핸들러
```

> 이 디렉토리는 데모 콘텐츠와 독립이다 — `wipe-demo.sh`는 `mcp-server/`를 건드리지 않는다.
