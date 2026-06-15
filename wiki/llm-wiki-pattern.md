---
type: concept
created: 2026-06-15
updated: 2026-06-15
sources:
  - "[[sources/karpathy-llm-wiki-comments]]"
tags: [llm-wiki, harness-design, meta]
aliases: [LLM Wiki Pattern, Karpathy Wiki]
---

# LLM Wiki 패턴 (Karpathy)

> [!summary]
> LLM이 유지보수하는 위키의 아키텍처 패턴. raw 소스(immutable) / wiki layer(LLM 소유) / schema(설정) 3계층 위에서 ingest·query·lint 3대 연산을 돈다. 핵심 가설: 매 query마다 RAG로 raw를 재검색하는 대신, LLM이 영속·상호연결된 지식 베이스를 점진 구축·유지하면 위키가 누적 자산이 된다. (출처: Karpathy gist, [[sources/karpathy-llm-wiki-comments]])

## 3계층

| 계층 | 성격 | 소유 |
|------|------|------|
| raw sources | immutable, 진실의 원천 | 사람 (LLM 읽기만) |
| wiki layer | cross-link 마크다운, 종합물 | LLM |
| schema (CLAUDE.md) | ingest/query/maintain 설정 | 사람+LLM 공진화 |

## 3대 연산

- **Ingest** — 새 소스 처리, 여러 위키 페이지 갱신.
- **Query** — 검색·종합, 답을 새 페이지로 환류.
- **Lint** — 모순·orphan·stale claim 헬스체크.

## 핵심 가설과 그에 대한 반론

- 가설(Karpathy): 위키는 시간이 갈수록 누적된다. 사람은 큐레이션·질문, LLM은 bookkeeping.
- 반론([[context-vs-rag]], witwaycorp): 정제·인덱싱이 끝나면 검색 자체엔 AI가 불필요할 수 있다 — AI 가치는 **읽기가 아니라 쓰기(횡적 종합)**에 있다.

## 관련

- [[concurrent-ingest-race-condition]] — 다중 writer가 같은 위키를 쓸 때의 동시성 문제.
- [[typed-edges]] — 페이지 간 관계를 타입드 엣지로 표현.
- [[provenance-and-supersede]] — claim 추적·승격·supersede 모델.
- [[context-vs-rag]] — 이 패턴이 RAG보다 유리한 규모 영역.

## 열린 질문

- 이 패턴을 이벤트성 지식(예: 결정 기록)으로 확장할 때, 그런 페이지는 별도 `type`인가 concept인가?
