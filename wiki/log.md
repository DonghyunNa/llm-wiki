---
type: log
---

# Log

위키 활동 기록. **append-only**. 각 항목은 `## [YYYY-MM-DD] {op} | {title}` 형식으로 시작한다.

- `op` ∈ {`ingest`, `query`, `lint`, `manual`}
- 본문에는 무엇을 했는지·어떤 페이지가 영향받았는지 짧게.

`grep "^## \[" wiki/log.md | tail -10` 으로 최근 활동을 빠르게 본다.

## [2026-06-15] lint | P0:4 P1:0 P2:14

- 범위: 전체 (12 content pages + index + log). 6개 카테고리 검사.
- **P0:4** — 의도된 데모 모순 4건 (`> [!note] 충돌` 블록): [[default-stack-choice]], [[fullstack-framework]], [[nextjs]], [[coding-agent-friendly-stack]] ([[sources/why-nextjs-default-stack]] ↔ [[sources/against-nextjs-default]]). 진짜 정합성 결함 아님 — 데모 의도.
- **P1:0** — stale claim·핵심 missing-xref 없음.
- **P2:14** — 단일 소스 페이지 5 (Meta 클러스터, 모두 Karpathy gist 1개) + 열린 질문 블록 5 + 단일 소스 데이터갭 권고. orphan 0, dead-link 0, frontmatter 정합 100%.

## [2026-06-15] ingest | Next.js 기본값에 대한 반론

- 소스: [[sources/against-nextjs-default]] ([[sources/why-nextjs-default-stack]]에 대한 직접 반론 노트).
- 생성: [[sources/against-nextjs-default]]. 새 concept 페이지는 만들지 않음 (반론 3논점은 기존 페이지 충돌 블록으로 흡수).
- **모순 4건 보존** — `> [!note] 충돌` 블록 추가: [[default-stack-choice]](기본값=고민 절감 ↔ 사고정지·과잉엔지니어링), [[fullstack-framework]](점진적 분리 가능 ↔ 락인·재작성 비용), [[nextjs]](풀스택 적절 ↔ 무겁고 락인), [[coding-agent-friendly-stack]](예시 풍부=정확 ↔ 구식 예시 혼입·환각). 기존 주장은 삭제하지 않고 양쪽 보존, lint가 P0로 후속 검토.

## [2026-06-15] ingest | 왜 Next.js를 기본 스택으로 쓰는가

- 소스: [[sources/why-nextjs-default-stack]] (Next.js 기본 스택 결정 노트).
- 생성: [[nextjs]], [[fullstack-framework]], [[coding-agent-friendly-stack]], [[default-stack-choice]].
- 새 도메인 "Tech Stack — Web Development" 카테고리 신설 (Meta 도메인과 분리). 핵심 논거(예시 풍부함 = 에이전트 정확도)는 [[coding-agent-friendly-stack]]에 집중.

## [2026-06-15] ingest | Karpathy LLM Wiki gist + 커뮤니티 댓글

- 소스: [[sources/karpathy-llm-wiki-comments]] (gist 원문 + 댓글 인사이트).
- 생성: [[llm-wiki-pattern]], [[concurrent-ingest-race-condition]], [[typed-edges]], [[provenance-and-supersede]], [[context-vs-rag]].
- 7개 개념 후보 → 5페이지로 큐레이션. 모순(Karpathy↔witwaycorp)은 [[context-vs-rag]]에 `> [!note]`로 보존.
