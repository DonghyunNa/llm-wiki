# llm-wiki

이 vault는 Karpathy 스타일 [LLM Wiki](https://karpathy.bearblog.dev/) 패턴의 Claude Code 인스턴스다.

> 사람은 소스를 큐레이션하고 질문한다. LLM은 읽고, 요약하고, 교차참조하고, 갱신한다. 위키는 누적되는 자산이다.

## Domain

> _이 vault의 목적·도메인을 한 줄로 적는다. 예: "Tolkien Legendarium 독서 동반 위키", "AI 정렬 연구 노트", "내 자기관리·정신건강 추적"._

`[YOUR DOMAIN HERE]`

> 데모 저장소에는 예시로 "기술 스택 선택" 데이터가 들어 있다. `scripts/wipe-demo.sh`로 비운 뒤 이 칸을 자기 도메인으로 채운다.
> 팁: 위키피디아·웹 검색으로 즉시 나오는 공개 지식보다, 모델이 모르는 것(사적·내부·맥락 의존적이고 안 적으면 휘발되는 지식)일수록 위키의 효용이 크다.

도메인이 정해지면:
- `wiki/index.md`의 카테고리를 자기 도메인에 맞게 조정.
- entity/concept naming 컨벤션을 정해 첫 ingest 때 확립.

## 구조

3 레이어:

| 레이어 | 위치 | 누가 쓰나 |
|--------|------|---------|
| **raw 소스** (immutable) | `raw/` | 사람 (LLM은 읽기만) |
| **위키** (LLM 생성/유지보수) | `wiki/` | LLM |
| **스키마** (이 파일) | `CLAUDE.md` | 사람 + LLM 공동 진화 |

위키 디렉토리 안:

```
wiki/
├── index.md           # 카탈로그
├── log.md             # append-only 활동 기록
├── sources/{slug}.md  # 원본 1건당 1페이지
├── syntheses/{slug}.md # query 답이 진화한 분석
└── {entity}.md, {concept}.md  # 그 외
```

## 하네스: llm-wiki

**목표:** 소스를 누적해 살아 있는 위키를 만든다.

**트리거:** 위키 관련 작업 — 새 소스 처리, 위키에 질의, 헬스 체크 — 가 요청되면 `llm-wiki` 스킬을 사용하라. 단순 잡담은 직접 응답 가능.

자연어 트리거 (영문/한글 혼용 OK):
- "이 글 정리해줘", "넣어줘", "추가해줘"
- "내 위키에 X 관련 뭐 있어?", "X에 대해 내가 뭘 적었지?"
- "비교해줘", "관계 찾아줘"
- "위키 점검", "lint", "건강 체크"

명시적 트리거:
- `/llm-wiki ingest`, `/llm-wiki query`, `/llm-wiki lint`

**에이전트:** `.claude/agents/`에 정의됨 — `wiki-ingest-curator`, `wiki-query-answerer`, `wiki-linter`. 모두 `model: "opus"`.

**스킬:** `.claude/skills/llm-wiki/` — 디스패처 + 컨벤션·워크플로우 references.

## 페이지 컨벤션 (요약)

- **frontmatter 필수**: `type`, `created`, `updated`, `sources`, `tags`.
- **위키링크 `[[page]]`** 사용 (Obsidian graph view용).
- **페이지 슬러그**: 소문자 + 하이픈, 단수.
- **모순은 삭제 금지** — `> [!note] 충돌` 블록으로 양쪽 보존, lint가 후속 처리.

세부 컨벤션: `.claude/skills/llm-wiki/references/conventions.md`.

## 운영 원칙

1. **LLM이 쓴다, 사람이 읽는다.** 사람은 소스 큐레이션·질문·방향 결정만.
2. **위키는 누적 자산.** ingest/query/lint 모든 결과가 위키로 흘러 들어간다 (chat에 사라지지 않게).
3. **모순은 진단 대상, 삭제 대상 아니다.** lint가 우선순위로 잡아 사람이 결정.
4. **미니멀에서 시작.** 페르소나 3명·페이지 카테고리 최소. 필요에 따라 확장.
5. **Obsidian이 IDE.** vault를 Obsidian으로 열고 graph view에서 자라는 모양을 본다.

## 변경 이력

| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-06-14 | 초기 구성 | 전체 | 신규 vault — Karpathy LLM Wiki 패턴 B-lite (skills + 3 agents) 초기화 |
