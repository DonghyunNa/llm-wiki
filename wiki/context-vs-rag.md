---
type: concept
created: 2026-06-15
updated: 2026-06-15
sources:
  - "[[sources/karpathy-llm-wiki-comments]]"
tags: [llm-wiki, harness-design, retrieval, meta]
aliases: [context vs RAG, RAG overhead]
---

# Context vs RAG (규모와 "읽기엔 AI 빼기")

> [!summary]
> LLM 위키에서 검색을 어떻게 할지의 규모 논쟁. Shilren: ~50k–100k 토큰 아래에선 **context가 RAG를 압도**하고 200k–1M 윈도우에선 RAG는 순수 오버헤드. witwaycorp(회의론): 데이터가 정제·인덱싱되면 검색에 AI가 왜 필요한가 — **AI의 가치는 읽기가 아니라 쓰기(ingest 시 횡적 종합)**에 있다. (출처: [[sources/karpathy-llm-wiki-comments]])

## scale: context가 RAG를 이기는 영역 (Shilren)

- ~50k–100k 토큰 아래에선 context가 RAG를 압도. vector DB·청킹 튜닝 불필요.
- 200k–1M 윈도우에선 RAG는 순수 오버헤드.

## 회의론: 읽기엔 AI 빼기 (witwaycorp)

- 데이터가 인덱싱·정제되고 나면 왜 검색에 AI를 쓰나? 검색엔진이 같은 일을 한다.
- 블록체인처럼 — DB로 풀릴 걸 과잉설계하는 것 아닌가?
- **함의: AI의 가치는 "읽기(검색)"가 아니라 "쓰기(ingest 시 횡적 종합)"에 있다.**

> [!note] 긴장 (defect 아님)
> Karpathy의 [[llm-wiki-pattern]]은 "RAG 대신 누적 위키"를 내세우지만, witwaycorp는 "정제 후 읽기엔 AI 불필요"라며 패턴의 가치 무게중심을 ingest 쪽으로 옮긴다. 두 입장은 충돌이라기보다 **AI의 가치가 어디 있는가에 대한 강조점 차이** — 양쪽 보존.

## 이 vault와의 연결

이 vault는 소규모(현재 30+ 페이지)라 Shilren 기준상 context 영역에 해당 — RAG 인프라 없이 직접 읽기로 충분. witwaycorp 함의는 ingest 큐레이터(쓰기)에 자원을 집중하라는 운영 지침과 일치.

## 관련

- [[llm-wiki-pattern]] — 이 논쟁이 검증하려는 상위 가설.
- [[provenance-and-supersede]] — "검색은 인프라지 메모리가 아니다"(vvvvvivekkk)와 같은 결.
