---
type: concept
created: 2026-06-15
updated: 2026-06-15
sources:
  - "[[sources/karpathy-llm-wiki-comments]]"
tags: [llm-wiki, harness-design, provenance, meta]
aliases: [provenance, supersede-not-delete, 승격 게이트]
---

# Provenance와 supersede (삭제 대신 대체)

> [!summary]
> 모든 claim을 출처·범위·추출자·시점으로 추적하고(provenance), 틀린 사실은 삭제하지 않고 **supersede**하여 "그때 믿었던 것"을 보존하는 모델. 자율 쓰기는 평가·귀속 확인·audit **게이트를 통과한 뒤에만** 허용. (vvvvvivekkk, Archimondstat — [[sources/karpathy-llm-wiki-comments]])

## Provenance (vvvvvivekkk, LLM-Wiki-v3)

- 마크다운 + Git이 **유일한 진실 원천**. 인덱스·그래프는 폐기 가능(재생성).
- 모든 claim은 **source·span·extractor·timestamp**로 추적.
- 지식은 소멸하지 않는다. **사실은 supersede되지 삭제되지 않으며, 믿었던 시점의 것을 보존**한다.
- 검색은 인프라(BM25+dense+graph+RRF+rerank)지 메모리 자체가 아니다.
- 자율 쓰기는 게이팅(평가·귀속 확인·audit) 후에만.

## 승격 게이트 / hallucination 누적 (Archimondstat)

- vault가 커질수록 **hallucination 누적 확률이 1에 수렴**한다.
- 워크플로우: 사용자가 아이디어 제안 → AI가 반박(Socratic) → **살아남으면 위키로 승격**.
- 철학: 위키는 사용자의 아이디어를 정련해야지, AI의 추측을 저장하면 안 된다.

## 이 vault와의 연결

CLAUDE.md 운영 원칙 "모순은 진단 대상, 삭제 대상 아니다"와 직결. supersede 모델은 [[typed-edges]]의 `supersedes` 엣지로 표현되고, 승격 게이트는 [[concurrent-ingest-race-condition]]의 리뷰 큐와 같은 정신(자동 반영 금지)이다.

## 관련

- [[llm-wiki-pattern]] — 상위 패턴.
- [[typed-edges]] — supersedes를 엣지로 표현.
- [[concurrent-ingest-race-condition]] — 게이팅/리뷰 큐의 동시성 짝.

## 열린 질문

- decision 로그에서 "철회된 결정"을 supersede로 보존할 때, 승격 게이트는 누가 통과시키나(사람 confirm vs 자동)?
