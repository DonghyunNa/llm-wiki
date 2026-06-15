---
type: concept
created: 2026-06-15
updated: 2026-06-15
sources:
  - "[[sources/karpathy-llm-wiki-comments]]"
tags: [llm-wiki, harness-design, concurrency, meta]
aliases: [동시성, race condition, 직렬 ingest]
---

# 동시 ingest와 race condition

> [!summary]
> 여러 에이전트가 같은 위키를 동시에 쓸 때 생기는 정합성 문제. 핵심 통찰(watsonrm, [[sources/karpathy-llm-wiki-comments]]): branch-and-merge는 **텍스트 충돌만** 푼다 — 두 에이전트가 같은 사실을 다른 표현으로 쓰면 git은 깔끔히 merge하지만 위키엔 의미 중복이 남는다. git이 못 보는 **의미 계층**의 문제다.

## 문제

- 텍스트 충돌 ≠ 의미 충돌. git merge는 전자만 해결.
- 의미 중복/모순은 텍스트 근접성으로 탐지 불가.

## 해법 (watsonrm)

- writer를 **파일/섹션별로 분할** + **append-only 쓰기** → 쓰기가 commute(교환 가능). 각 에이전트가 자기 줄만 쓴다.
- **결정적 merge driver**를 쓰고, LLM의 충돌 해결은 거부(비결정성 추가됨).
- 모순 탐지는 텍스트 근접성이 아니라 **안정적 claim 식별자(citation)**로 키를 잡는다.
- 자동 해결 금지 → 충돌은 **리뷰 큐**로. (cf. [[provenance-and-supersede]]의 게이팅, [[typed-edges]]의 contradicts 엣지)
- dedup은 영구적 **의미 계층**으로 둔다(git이 못 보므로).

## 실무 함의

여러 소스를 자동·배치로 ingest하는 환경에서는 **직렬 ingest·멱등성·단일 쓰기·의미 충돌 분리**가 핵심 설계 원칙이 된다. watsonrm의 댓글이 이 설계를 외부에서 검증한다.

## 관련

- [[llm-wiki-pattern]] — 이 문제가 발생하는 상위 패턴.
- [[provenance-and-supersede]] — 충돌을 삭제 대신 보존·승격하는 모델.
- [[typed-edges]] — 충돌을 콘텐츠(contradicts 엣지)로 표현.

## 열린 질문

- 배치로 다중 소스를 동시 ingest할 때, 직렬화 큐 vs 섹션 분할 append 중 무엇을 기본으로 둘까?
