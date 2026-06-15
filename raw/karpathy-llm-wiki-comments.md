# Karpathy LLM Wiki gist — 원문 + 커뮤니티 댓글 인사이트

출처: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
클립: 2026-06-15 (WebFetch로 gist 본문 + 댓글 추출)

## 원문 (Karpathy)

LLM이 유지보수하는 위키의 3계층 아키텍처:

1. **Raw sources** (immutable) — 기사·논문·노트. 진실의 원천.
2. **Wiki layer** (LLM 소유) — 소스를 종합한 cross-link 마크다운 페이지.
3. **Schema** (CLAUDE.md) — LLM에게 ingest/query/maintain 방법을 알려주는 설정.

핵심 통찰: 매 query마다 raw 문서를 재검색(RAG)하는 대신, LLM이 영속적·상호연결된 지식 베이스를 점진적으로 구축·유지한다. 위키는 시간이 갈수록 누적된다. 사람은 소스를 큐레이션하고 질문하고, LLM은 bookkeeping(요약·교차참조·모순 flag·정합성 유지)을 담당.

3대 연산: **Ingest**(새 소스 처리, 여러 위키 페이지 갱신), **Query**(검색·종합, 답을 새 페이지로 환류), **Lint**(모순·orphan·stale claim 헬스체크).

## 커뮤니티 댓글에서 추출한 핵심 인사이트

### 동시성·race condition (watsonrm)
- branch-and-merge는 **텍스트 충돌만** 푼다. **의미 충돌은 못 푼다** — 두 에이전트가 같은 사실을 다른 표현으로 쓰면 git은 깔끔히 merge하지만 위키엔 중복이 남는다.
- 해법: writer를 파일/섹션별로 분할 + append-only 쓰기 → 쓰기가 commute(교환 가능). 각 에이전트가 자기 줄만 쓴다.
- dedup은 여전히 필요한 **의미 계층** (git이 못 봄). 영구적 구조 계층으로 둬라.
- **결정적 merge driver를 쓰고, LLM의 충돌 해결은 거부하라** (비결정성 추가됨).
- 모순 탐지는 텍스트 근접성이 아니라 **안정적 claim 식별자(citation)** 로 키를 잡아라. 충돌은 자동 해결 말고 **리뷰 큐**로 보내라.

### typed edges / 모순은 콘텐츠 (pursultani)
- contradiction을 defect로 보는 기본 인식론은 객관 도메인용. 인문·철학에선 모순 자체가 콘텐츠.
- 정책(어떤 모순을 flag할지)과 표현(어떻게 나타낼지)을 혼동하지 마라.
- 해법: frontmatter에 typed relationship 블록 — contradicts, supports, extends, **supersedes** 등.
- 미해결 난제: 어휘 거버넌스. "extends냐 supersedes냐" 판정은 진짜 온톨로지 작업.

### 버전·provenance (vvvvvivekkk, LLM-Wiki-v3)
- 마크다운 + Git이 유일한 진실 원천. 인덱스·그래프는 폐기 가능(재생성).
- provenance 필수: 모든 claim은 source·span·extractor·timestamp로 추적.
- **지식은 소멸하지 않는다. 사실은 supersede되지 삭제되지 않는다. 믿었던 시점의 것을 보존하라.**
- 검색은 인프라(BM25+dense+graph+RRF+rerank)지 메모리 자체가 아니다.
- 자율 쓰기는 게이팅(평가·귀속 확인·audit) 후에만.

### hallucination 누적 / Socratic 검증 (Archimondstat)
- vault가 커질수록 hallucination 누적 확률이 1에 수렴.
- 워크플로우: 사용자가 아이디어 제안 → AI가 반박 → 살아남으면 위키로 승격.
- 철학: 위키는 사용자의 아이디어를 정련해야지, AI의 추측을 저장하면 안 된다.

### scale: context vs RAG (Shilren)
- ~50k–100k 토큰 아래에선 context가 RAG를 압도. vector DB·청킹 튜닝 불필요.
- 200k–1M 윈도우에선 RAG는 순수 오버헤드.

### 회의적 시각 (witwaycorp)
- 데이터가 인덱싱·정제되고 나면 왜 검색에 AI를 쓰나? 검색엔진이 같은 일 한다.
- 블록체인처럼 — DB로 풀릴 걸 과잉설계하는 것 아닌가?
- 함의: AI의 가치는 "읽기(검색)"가 아니라 "쓰기(ingest 시 횡적 종합)"에 있다.

### 기타 구현 사례
- Shilren: interview-doc-agent — 흩어진 경력 기록을 단일 진실 라이브러리로.
- skyllwt (AutoSci): 자율 연구 에이전트, "sleep" 단계로 메모리 통합·재가중.
- Z-M-Huang (Dense-Mem): MCP 메모리 서버 — host LLM과 메모리 계층 분리, typed claim·provenance.
- memwiki (hereisSwapnil): 프로젝트 중심 코딩 에이전트 메모리 — "Agent Amnesia" 해결. .memory/ + hook 파일.
- Clod (llmwiki-marimo): SQLite+FTS5, citation을 contract로, 좋은 답을 폼으로 영구 승격.
- kytmanov (Synto): 로컬 전용, per-role provider, concept rename 시 모든 링크 원자적 갱신.

## 메모 (이 클립의 맥락)

이 소스는 llm-wiki 패턴을 자동·다중 소스 환경으로 확장할 때의 운영 난제를 살피며 수집됨. 관심사: 다중 참조자, 배치 자동화, 직렬 ingest, race condition 회피. 커뮤니티 댓글이 직렬 ingest·멱등성·단일 쓰기·의미 충돌 분리 같은 설계를 외부에서 검증해줌 — 특히 watsonrm(동시성), pursultani(typed edges), vvvvvivekkk(provenance/supersede), witwaycorp(읽기엔 AI 빼기)가 직격.
