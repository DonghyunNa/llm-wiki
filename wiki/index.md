---
type: index
updated: 2026-06-15
---

# Index

위키의 모든 페이지를 카테고리별로 정렬한 카탈로그. 새 페이지가 추가되거나 기존 페이지가 의미상 바뀔 때 갱신한다.

## Meta — LLM Wiki Pattern

> LLM Wiki 패턴/하네스 설계 그 자체에 대한 지식. 출처: [[sources/karpathy-llm-wiki-comments]].

- [[llm-wiki-pattern]] — raw/wiki/schema 3계층 + ingest/query/lint 3연산의 Karpathy 위키 패턴.
- [[concurrent-ingest-race-condition]] — 다중 writer 동시성: git은 텍스트 충돌만, 의미 충돌은 별도 계층.
- [[typed-edges]] — 페이지 관계를 contradicts/supports/extends/supersedes 타입드 엣지로.
- [[provenance-and-supersede]] — claim 추적 + 삭제 대신 supersede + 승격 게이트.
- [[context-vs-rag]] — 소규모에선 context가 RAG 압도, AI 가치는 읽기보다 쓰기.

## Tech Stack — Web Development

> 새 웹 프로젝트의 기술 스택 선택에 대한 지식. 출처: [[sources/why-nextjs-default-stack]] + 반론 [[sources/against-nextjs-default]] (네 페이지에 `> [!note] 충돌` 보존).

- [[nextjs]] — React 기반 풀스택 메타프레임워크. 새 웹 프로젝트의 기본 스택 후보.
- [[fullstack-framework]] — 프론트+백엔드를 한 코드베이스에서 다루는 프레임워크 범주.
- [[coding-agent-friendly-stack]] — 예시 풍부함 → 에이전트가 더 정확·관용적 코드. 프레임워크 선택의 새 축.
- [[default-stack-choice]] — 매번 고민하지 않게 기본값 스택을 두는 메타 결정 패턴.

## Sources

- [[sources/karpathy-llm-wiki-comments]] — Karpathy LLM Wiki gist 원문 + 커뮤니티 댓글 인사이트.
- [[sources/why-nextjs-default-stack]] — Next.js를 기본 스택으로 두는 근거 (풀스택·예시 풍부·에이전트 친화).
- [[sources/against-nextjs-default]] — 위 근거에 대한 직접 반론 (기본값=사고정지·락인·구식 예시 환각).

## Syntheses

_아직 없음._

## Notes

- 각 항목은 `[[page-name]]` 위키링크 + 한 줄 요약.
- 카테고리는 도메인에 맞춰 자유롭게 추가/제거.
