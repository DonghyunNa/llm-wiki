# Wiki 페이지 컨벤션

Obsidian-퍼스트. 모든 페이지가 graph view·backlink·Dataview에서 자연스럽게 동작하도록.

## 디렉토리

```
wiki/
├── index.md              # 카탈로그 (모든 페이지 + 한 줄 요약)
├── log.md                # append-only 활동 기록
├── sources/{slug}.md     # 원본 1건당 1페이지
├── syntheses/{slug}.md   # query 답이 진화한 분석/비교
├── decisions/{slug}.md   # 회의 결과·주요 결정사항 (이벤트성, status·supersedes 추적)
└── {entity-or-concept}.md  # 그 외 모든 페이지는 루트에
```

도메인이 정해지면 루트 페이지를 카테고리 디렉토리로 분리 가능 (예: `wiki/characters/`, `wiki/themes/` 등). 시작은 평탄하게.

## Frontmatter (필수)

모든 페이지는 YAML frontmatter로 시작한다:

```yaml
---
type: source | entity | concept | synthesis | decision | index | log
created: 2026-06-14
updated: 2026-06-14
sources:
  - "[[sources/article-slug]]"
  - "https://example.com/external"
tags: [tag1, tag2]
aliases: [Alternative name]   # 옵션
---
```

- `type`: 페이지의 카테고리. lint와 인덱싱에 사용.
- `created`/`updated`: 자동으로 채우지 않는다 — LLM이 매번 명시.
- `sources`: 페이지가 의존하는 출처. 위키 내부면 wikilink, 외부면 URL.
- `tags`: 도메인별 자유. 적게.
- `aliases`: 같은 entity의 다른 이름. Obsidian 검색에 도움.

## 위키링크

본문에서 다른 페이지를 가리킬 때는 항상 `[[page-name]]` 형식.

- `[[page]]` — 페이지 이름이 곧 표시 텍스트.
- `[[page|표시 텍스트]]` — 다른 표시 텍스트 필요할 때.
- 외부 URL은 일반 마크다운 `[text](url)`로.

페이지 이름은 **소문자 + 하이픈** (`attention-mechanism`, `bilbo-baggins`). 공백 없음. graph 노드 식별자.

## 페이지 형식 (typical)

### Source 페이지 (`wiki/sources/{slug}.md`)

```markdown
---
type: source
created: ...
sources: ["https://원본 URL"]
tags: [...]
---

# {원문 제목}

> [!summary] 한 줄 요약
> ...

## 핵심 주장
- ...

## 인용 가능 발췌
> "..." — 페이지/타임스탬프

## 영향받은 위키 페이지
- [[page-a]], [[page-b]] (강화)
- [[page-c]] (충돌 — 본 페이지 참조)

## 메모
사용자와의 대화에서 강조된 포인트.
```

### Entity / Concept 페이지

```markdown
---
type: entity | concept
created: ...
updated: ...
sources: [[[sources/a]], [[sources/b]]]
tags: [...]
aliases: [...]
---

# {Name}

> [!summary]
> 한 문단 정의.

## 본문
구조는 자유. 보통 1~3개 헤딩.

## 관련
- [[page-x]] — 관계 설명
- [[page-y]] — 관계 설명

## 열린 질문
- (있으면) 추가 조사 필요한 것
```

### Synthesis 페이지 (`wiki/syntheses/{slug}.md`)

query 답이 가치 있어 파일링된 것.

```markdown
---
type: synthesis
created: ...
sources: [...]
tags: [...]
---

# {분석/비교 제목}

> [!question] 원 질문
> ...

## 답
인용 포함 본문.

## 도출 과정
어떤 페이지를 어떻게 엮었는지.
```

### Decision 페이지 (`wiki/decisions/{slug}.md`)

회의 결과·주요 결정사항 등 **이벤트성 지식**. 개념(concept)과 달리 날짜·참석자·상태·번복 관계가 1급 메타데이터다. 근거: [[provenance-and-supersede]](삭제 말고 supersede, 믿었던 시점 보존), [[typed-edges]](decision supersedes decision 엣지).

```markdown
---
type: decision
created: 2026-06-15
updated: 2026-06-15
date: 2026-06-15          # 결정이 내려진 날 (created와 다를 수 있음)
status: active           # active | superseded | rejected | deferred
participants: [이름, ...]  # 회의 참석자 (옵션)
supersedes: [[이전-결정]]   # 이 결정이 번복/대체한 과거 결정 (옵션)
superseded-by:           # 자동으로 채워지지 않음 — 번복될 때 lint/ingest가 역링크
sources: ["[[sources/회의록-slug]]"]
tags: [domain, ...]
---

# {결정 한 줄 제목}

> [!summary] 결정
> 무엇을 결정했는지 한 문단.

## 맥락
왜 이 결정이 필요했는지. 대안은 무엇이었는지.

## 근거
- 이 결정을 뒷받침한 논거 (인용 포함).

## 영향
- [[page-a]] — 이 결정이 바꾸는 것.

## 열린 질문
- (있으면) 후속 결정이 필요한 것.
```

**철칙 (커뮤니티 검증됨):**
- **삭제 금지.** 번복된 결정은 지우지 말고 `status: superseded` + 새 결정에 `supersedes` 링크. "믿었던 시점"을 보존 (→ [[provenance-and-supersede]]).
- **충돌은 LLM이 해결하지 않는다.** 같은 사안에 모순되는 결정이 들어오면 `> [!note] 충돌`로 양쪽 보존 + 사람 리뷰 큐로. lint가 P0로 잡음 (→ [[concurrent-ingest-race-condition]]).
- **배치 ingest는 날짜순 직렬.** 여러 회의록을 한 번에 ingest할 때 `date` 오름차순으로 1건씩. 번복 순서가 뒤집히면 `supersedes`가 깨짐 (→ [[concurrent-ingest-race-condition]]).

## 명명 규칙

- 페이지 슬러그: 소문자 + 하이픈, 짧게. 의미 단위로 절단 가능해야.
- entity는 단수 (`character`가 아니라 `bilbo-baggins`, `attention-mechanism` 같이).
- 약어가 일반적이면 약어 사용 + `aliases`에 풀네임 (`gpt`, aliases: `[Generative Pretrained Transformer]`).

## 모순 표기

기존 페이지의 주장과 새 소스가 충돌할 때:

```markdown
> [!note] 충돌
> [[sources/old-paper]]는 X라고 함.
> [[sources/new-paper]] (2026)는 Y라고 함.
> 후속 검토 필요.
```

삭제하지 않고 양쪽 보존. lint가 P0로 잡아 사용자가 결정.

## Index 항목 형식

`wiki/index.md`의 각 항목:

```markdown
- [[page-name]] — 한 줄 요약 (≤80자).
```

카테고리는 frontmatter `type` 기준 + 도메인 자유 추가.

## 로그 항목 형식

`wiki/log.md`의 각 항목:

```markdown
## [YYYY-MM-DD] {op} | {title}

- 무엇을 했는지 1~3줄.
- 영향 페이지: [[a]], [[b]], ...
```

`op` ∈ `ingest`, `query`, `lint`, `manual`. 한 줄로 grep 가능한 형식 유지.
