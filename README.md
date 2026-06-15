# llm-wiki

Karpathy 스타일 [LLM Wiki](https://karpathy.bearblog.dev/) 패턴의 Claude Code 템플릿.

> Obsidian이 IDE, LLM이 프로그래머, 위키가 코드베이스.

## 무엇인가

raw 소스를 던지면 LLM이 읽고 **위키를 점진적으로 누적**한다. RAG처럼 매번 재검색하지 않고, 한 번 컴파일된 지식을 계속 최신 상태로 유지한다.

- **raw/** — 원본 (immutable, LLM은 읽기만)
- **wiki/** — LLM이 쓰는 마크다운 (Obsidian 호환: wikilink + frontmatter)
- **CLAUDE.md** — 스키마·컨벤션·워크플로우
- **.claude/agents/** — ingest / query / lint 전문가
- **.claude/skills/llm-wiki/** — 디스패처 (자연어 트리거)

## 이 저장소에 담긴 데모

클론하면 위키가 어떻게 동작하는지 바로 볼 수 있도록 **예시 데이터**가 들어 있다. Obsidian으로 `wiki/`를 열어 graph view를 보면 가장 직관적이다.

**1) 횡적 연결** — `raw/why-nextjs-default-stack.md`(글 1편)를 ingest한 결과:
`[[nextjs]]`를 허브로 [[fullstack-framework]], [[coding-agent-friendly-stack]], [[default-stack-choice]]가 cross-link된 그래프. 글 하나가 재사용 가능한 개념 노드들로 분해된다.

**2) 모순 보존** — `raw/against-nextjs-default.md`(반론 글)를 추가 ingest하면, 기존 페이지를 덮어쓰지 않고 `> [!note] 충돌` 블록으로 **양쪽 관점을 출처와 함께 병기**한다. ([[coding-agent-friendly-stack]] 등 4페이지에서 확인 가능.) 모순은 삭제 대상이 아니라 자산이다.

**3) 건강 진단** — `wiki/log.md`에 ingest → ingest → lint 궤적이 남아 있다. lint가 위 4건 충돌을 검출하고 "의도된 것"과 "진짜 문제"를 구분한다.

그리고 `wiki/`의 **Meta 카테고리**(llm-wiki-pattern, typed-edges, provenance-and-supersede 등)는 이 패턴 자체에 대한 레퍼런스 노트다 — 데모 겸 실제로 쓸모 있는 지식.

## 시작하기

```bash
git clone <this repo> ~/my-wiki
cd ~/my-wiki
claude   # Claude Code 진입
```

처음 세션에서 자연어로:

- "이 글 정리해줘" → 클립보드/`raw/`의 새 파일을 ingest
- "X에 대해 내 위키에 뭐 있어?" → query
- "위키 건강 체크해줘" → lint

또는 명시적으로 `/llm-wiki ingest`, `/llm-wiki query …`, `/llm-wiki lint` 도 가능.

## 다른 프로젝트에서 위키 참조하기

이 vault를 다른 프로젝트·에이전트가 참조하는 길은 두 가지다. 목적에 따라 고르거나 둘 다 쓴다.

### 옵션 1 — 로컬 파일 참조 (설정 0)

가장 단순하다. 참조할 프로젝트의 `CLAUDE.md`에 경로 포인터 한 줄만 추가하면, 그 프로젝트의 Claude가 Read/Grep으로 위키를 직접 읽는다.

```markdown
<!-- 다른 프로젝트의 CLAUDE.md -->
참고 지식: 위키 지식은 `~/path/to/llm-wiki/wiki/` 를 참조한다 (index.md 부터).
```

- **장점**: 등록·의존성 0, 즉시. 같은 머신이면 이걸로 충분하다.
- **적합**: 가끔 참조, 같은 머신, 가벼운 사용.
- 진입점은 `wiki/index.md`(카탈로그) → 필요한 페이지로. `[[wikilink]]`를 따라가면 된다.

### 옵션 2 — MCP 서버 (구조화된 조회)

vault를 **읽기 전용 MCP 서버**로 노출하면, 다른 세션·에이전트가 구조화된 도구로 조회한다:
`search_wiki`(가중 키워드 검색) / `get_page` / `list_pages` / `get_backlinks`(그래프).

```bash
# user scope — 모든 프로젝트에서 사용
claude mcp add llm-wiki --scope user -- \
  npx tsx /절대경로/llm-wiki/mcp-server/src/index.ts
```

또는 참조할 프로젝트의 `.mcp.json`에:

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

- **장점**: 검색 스코어링·백링크 그래프·path traversal 보안 경계. 정밀·반복 조회에 유리.
- **적합**: 자주·정밀 조회, 여러 프로젝트, 읽기 경계가 필요할 때.
- 설치·검증·보안 상세: [mcp-server/README.md](mcp-server/README.md).

> **어느 쪽?** 정제된 마크다운은 검색만으로 충분할 때가 많다 (→ `wiki/context-vs-rag.md`). 로컬 참조로 시작하고, 검색 품질·백링크·경계가 필요해지면 MCP를 더한다. MCP가 로컬 참조를 *대체*하는 게 아니라 *보강*한다.
>
> MCP 서버(`mcp-server/`)는 데모 콘텐츠와 독립이라 `wipe-demo.sh` 대상이 아니다.

## 데모 지우고 내 위키 시작하기

데모를 충분히 둘러봤으면, **한 번** 실행해 Next.js 데모 데이터를 제거한다:

```bash
bash scripts/wipe-demo.sh
```

- 지움: Next.js 데모 (wiki 페이지 4 + source 2 + raw 2 + index/log의 관련 항목).
- 남김: Karpathy LLM Wiki 패턴 메타 페이지(쓸모 있는 레퍼런스), 하네스 전체.
- 스크립트는 끝나면 **자기 자신을 삭제**한다 — 실수로 두 번 돌지 않게.

그다음:

- `CLAUDE.md`의 `## Domain`을 자기 도메인으로 채운다 (책 위키? 연구 노트? 결정 로그?)
- `wiki/index.md` 카테고리를 자기 도메인에 맞게 정리
- Obsidian으로 vault 열고 graph view에서 위키가 자라는 모양을 본다

## 디렉토리 구조

```
.
├── CLAUDE.md           # Wiki schema + 하네스 포인터
├── README.md           # 이 파일
├── scripts/
│   └── wipe-demo.sh    # 데모 제거 (1회 실행 후 자가 삭제)
├── raw/                # 원본 소스
├── wiki/               # LLM이 쓰는 마크다운
│   ├── index.md        # 카탈로그
│   ├── log.md          # 활동 기록 (append-only)
│   ├── sources/        # 원본 1건당 1페이지
│   └── ...             # 페이지가 여기 쌓임
└── .claude/
    ├── agents/         # 전문가 정의
    │   ├── wiki-ingest-curator.md
    │   ├── wiki-query-answerer.md
    │   └── wiki-linter.md
    └── skills/
        └── llm-wiki/   # 디스패처
            ├── SKILL.md
            └── references/
                ├── conventions.md
                └── workflows.md
```

## 디자인 원칙

- **위키는 누적 자산.** 모든 ingest/query/lint 결과는 위키로 흘러 들어간다.
- **LLM이 쓴다, 사람이 읽는다.** 사람은 소스 큐레이션·질문·방향 결정만.
- **모순은 진단 대상, 삭제 대상 아니다.** 충돌은 `> [!note]`로 보존하고 lint가 잡는다.
- **Obsidian-퍼스트.** 모든 페이지는 frontmatter + `[[wikilink]]` 사용.
- **미니멀에서 시작.** 에이전트 3명으로 시작해 필요에 따라 확장.
