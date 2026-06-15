---
name: llm-wiki
description: LLM 위키(Karpathy 스타일)의 디스패처. 소스를 ingest해서 위키를 누적하거나, 위키에 질의하거나, 헬스 체크(lint)할 때 호출. 트리거 — "이거 정리해줘", "위키에 추가", "위키에 뭐 있어", "X에 대해 내가 뭘 적었지", "비교해줘", "위키 점검", "lint", "건강 체크", "/llm-wiki", "ingest", "query", "재실행", "다시 정리", "이전 답 개선", "Karpathy wiki", "오비시디안 위키 운영". raw/에 새 파일을 떨어뜨리고 "넣어줘"라고 해도 트리거.
---

# llm-wiki — 디스패처

LLM Wiki 패턴의 3대 연산(ingest / query / lint)을 적절한 전문가 에이전트로 라우팅한다.

## Phase 0: 컨텍스트 확인

워크플로우 시작 전에 항상:

1. `wiki/index.md`와 `wiki/log.md` 끝 10줄을 읽는다. 최근 활동·현재 카탈로그 상태 확인.
2. `raw/` 디렉토리 확인 — 새로 추가된 처리 안 된 파일이 있는지 (`wiki/sources/` 또는 log에 등록 안 된 것).
3. 사용자의 요청이 **신규**인지 **재실행/수정**인지 판단:
   - "다시", "재실행", "고쳐", "이전 답 개선" → 재실행 모드. 직전 산출물(`wiki/syntheses/`, 최근 ingest 페이지 등)을 먼저 읽고 그 위에서 수정.
   - 그 외 → 신규 모드.

## Phase 1: 의도 라우팅

사용자 요청을 3개 의도 중 하나로 분류한다:

| 신호 | 의도 | 처리 |
|------|------|------|
| 새 파일/URL/본문 + "정리/추가/요약/넣어" | **ingest** | `wiki-ingest-curator` 호출 |
| 질문("뭐 있어?", "X는?", "비교", "내가 뭐 적었지") | **query** | `wiki-query-answerer` 호출 |
| "점검", "lint", "헬스", "audit", "정합성" | **lint** | `wiki-linter` 호출 |
| 애매함 | **확인** | 사용자에게 어느 의도인지 한 줄 질문 |

**중요:**
- 의도가 명확하면 즉시 라우팅. 사용자 의도 확인 질문은 정말 모호할 때만.
- 의도 라우팅 결과를 한 줄로 사용자에게 알린다 ("ingest로 처리합니다" 등).

## Phase 2: 에이전트 호출

선택된 의도에 따라 해당 에이전트를 `Agent` 도구로 호출한다. 모드는 **서브 에이전트** (직접 호출, 반환값 기반):

- `wiki-ingest-curator` — `model: "opus"`, 입력은 raw 경로 또는 본문, 사용자와 단계적 confirm.
- `wiki-query-answerer` — `model: "opus"`, 입력은 자연어 질문, 답을 사용자에게 표시.
- `wiki-linter` — `model: "opus"`, 입력은 점검 범위(기본 전체), 리포트 표시 + log 1줄.

여러 의도가 섞인 요청은 순차로 처리한다 (예: "이 글 정리하고 X에 대해 뭐 적었는지도 알려줘" → ingest 후 query).

## Phase 3: 결과 통합 + 다음 행동 제안

에이전트 결과를 받으면:

1. 사용자에게 한 줄 요약 — "{op} 완료. 변경: {N}페이지. log/index 갱신됨."
2. 후속 행동 제안 (선택적, 자연스러울 때만):
   - ingest 후 → "관련 페이지 더 보강하려면 추가 소스가 도움됩니다. lint 돌려볼까요?"
   - query 후 → "이 답을 `wiki/syntheses/{slug}.md`로 저장할까요?"
   - lint 후 → "P0 N건 발견. 가장 위 항목부터 손 볼까요?"

## 페이지 컨벤션 / 워크플로우 디테일

세부 컨벤션·페이지 형식은 필요할 때 다음을 읽는다:
- 컨벤션 (frontmatter, wikilink, naming): `references/conventions.md`
- ingest/query/lint 각각의 정밀 워크플로우: `references/workflows.md`

## 에러 핸들링

- 위키가 비어 있고 사용자가 query/lint 요청 → "위키가 비어 있음. ingest부터 권장" 한 줄 안내.
- 에이전트 호출 실패 → 1회 재시도. 재실패 시 무엇이 실패했는지 사용자에게 보고하고 중단. 위키 상태는 건드리지 않는다.
- ingest 도중 `raw/`의 파일이 손상/접근불가 → 그 파일만 건너뛰고 다른 작업은 진행. 보고에 누락 표시.

## 테스트 시나리오

**정상 ingest:** 사용자가 `raw/article.md`를 두고 "이거 정리해줘" → ingest로 라우팅 → `wiki-ingest-curator` 호출 → 소스 페이지 + 횡적 갱신 + index/log 동기화 → 결과 보고.

**정상 query:** 사용자가 "내 위키에 'attention is all you need' 관련 뭐 있어?" → query로 라우팅 → `wiki-query-answerer` 호출 → 인용 포함 답 + file-back 제안.

**에러 — 빈 vault에 query:** 사용자가 "X에 대해 뭐 있어?" 했는데 `wiki/sources/` 비어 있음 → query 의도 인식 → 빈 상태 감지 → "위키가 비어 있어 답할 수 없음. 먼저 ingest 권장" 안내.

**의도 애매:** 사용자가 "이거 좋네" → 무엇을 의미하는지 한 줄 질문 ("ingest 할까요, 아니면 답에 만족한다는 뜻인가요?").

## 모델

이 스킬에서 호출하는 모든 Agent는 `model: "opus"`를 명시한다.
