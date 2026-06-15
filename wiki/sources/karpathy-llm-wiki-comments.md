---
type: source
created: 2026-06-15
updated: 2026-06-15
sources:
  - "raw/karpathy-llm-wiki-comments.md"
  - "https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f"
tags: [llm-wiki, harness-design, meta]
aliases: [Karpathy LLM Wiki gist, LLM Wiki comments]
---

# Karpathy LLM Wiki gist — 원문 + 커뮤니티 댓글

> [!summary] 한 줄 요약
> LLM이 유지보수하는 위키의 3계층(raw / wiki / schema) 패턴을 제시한 Karpathy의 gist와, 그 댓글에서 추출한 하네스 설계 인사이트. 동시성·typed edges·provenance·승격 게이트·context vs RAG·"읽기엔 AI 빼기" 등 [[llm-wiki-pattern]] 운영의 실질 난제들이 댓글러별 출처와 함께 정리됨.

## 원문 핵심 주장 (Karpathy)

- 3계층 아키텍처: **raw sources**(immutable, 진실의 원천) / **wiki layer**(LLM 소유, cross-link 마크다운) / **schema**(CLAUDE.md, ingest/query/maintain 설정).
- 매 query마다 RAG로 raw를 재검색하는 대신, LLM이 **영속·상호연결된 지식 베이스를 점진 구축·유지**한다. 위키는 누적된다.
- 역할 분담: 사람은 소스 큐레이션·질문, LLM은 bookkeeping(요약·교차참조·모순 flag·정합성).
- 3대 연산: **Ingest** / **Query** / **Lint**.

## 댓글 인사이트 (출처별)

- **watsonrm — 동시성/race condition**: branch-and-merge는 텍스트 충돌만 푼다, 의미 충돌은 git이 못 본다. 해법 = writer를 파일/섹션별로 분할 + append-only(쓰기 commute). dedup은 git이 못 보는 의미 계층으로 영구 배치. 결정적 merge driver를 쓰고 LLM의 충돌 해결은 거부. 모순은 텍스트 근접성이 아니라 안정적 claim 식별자(citation)로 키를 잡고 리뷰 큐로.
- **pursultani — typed edges**: contradiction을 defect로 보는 인식론은 객관 도메인용; 인문·철학에선 모순 자체가 콘텐츠. 정책(무엇을 flag)과 표현(어떻게 표시)을 분리. frontmatter에 typed relationship(contradicts/supports/extends/supersedes). 미해결 난제 = 어휘 거버넌스.
- **vvvvvivekkk (LLM-Wiki-v3) — provenance/supersede**: 마크다운+Git이 유일 진실, 인덱스·그래프는 폐기·재생성 가능. 모든 claim은 source·span·extractor·timestamp로 추적. 지식은 소멸하지 않는다 — 사실은 supersede되지 삭제되지 않으며 믿었던 시점을 보존. 검색은 인프라지 메모리가 아니다. 자율 쓰기는 게이팅 후에만.
- **Archimondstat — 승격 게이트/hallucination 누적**: vault가 커질수록 hallucination 누적 확률이 1에 수렴. 워크플로우 = 사용자 제안 → AI 반박 → 살아남으면 승격. 위키는 사용자 아이디어를 정련하지 AI 추측을 저장하지 않는다.
- **Shilren — context vs RAG scale**: ~50k–100k 토큰 아래에선 context가 RAG를 압도; 200k–1M 윈도우에선 RAG는 순수 오버헤드.
- **witwaycorp — 읽기엔 AI 빼기 (회의론)**: 데이터가 인덱싱·정제되면 검색에 AI가 왜 필요한가(검색엔진이 같은 일). DB로 풀릴 걸 과잉설계하는 것 아닌가. 함의 = AI의 가치는 읽기가 아니라 쓰기(ingest 시 횡적 종합)에 있다.

## 인용 가능 발췌

> "branch-and-merge는 텍스트 충돌만 푼다. 의미 충돌은 못 푼다." — watsonrm

> "지식은 소멸하지 않는다. 사실은 supersede되지 삭제되지 않는다. 믿었던 시점의 것을 보존하라." — vvvvvivekkk

> "vault가 커질수록 hallucination 누적 확률이 1에 수렴한다." — Archimondstat

> "AI의 가치는 읽기(검색)가 아니라 쓰기(ingest 시 횡적 종합)에 있다." — witwaycorp(함의)

## 기타 구현 사례 (참고용, 페이지화하지 않음)

- Shilren: interview-doc-agent — 흩어진 경력 기록을 단일 진실 라이브러리로.
- skyllwt (AutoSci): 자율 연구 에이전트, "sleep" 단계로 메모리 통합·재가중.
- Z-M-Huang (Dense-Mem): MCP 메모리 서버 — host LLM과 메모리 계층 분리, typed claim·provenance.
- memwiki (hereisSwapnil): 프로젝트 중심 코딩 에이전트 메모리("Agent Amnesia" 해결), `.memory/` + hook.
- Clod (llmwiki-marimo): SQLite+FTS5, citation을 contract로, 좋은 답을 폼으로 영구 승격.
- kytmanov (Synto): 로컬 전용, per-role provider, concept rename 시 모든 링크 원자적 갱신.

## 영향받은 위키 페이지

- [[llm-wiki-pattern]] (생성 — 원문 3계층 아키텍처)
- [[concurrent-ingest-race-condition]] (생성 — watsonrm)
- [[typed-edges]] (생성 — pursultani)
- [[provenance-and-supersede]] (생성 — vvvvvivekkk, Archimondstat 승격 게이트 포함)
- [[context-vs-rag]] (생성 — Shilren, witwaycorp 함의 포함)

## 메모

이 소스는 llm-wiki 패턴을 자동·다중 소스 환경으로 확장할 때의 운영 난제를 살피며 수집됨. 관심사: 다중 참조자, 배치 자동화, 직렬 ingest, race condition 회피. 커뮤니티 댓글이 직렬 ingest·멱등성·단일 쓰기·의미 충돌 분리 같은 설계를 외부에서 검증해줌 — 특히 watsonrm(동시성), pursultani(typed edges), vvvvvivekkk(provenance/supersede), witwaycorp(읽기엔 AI 빼기)가 직격.
