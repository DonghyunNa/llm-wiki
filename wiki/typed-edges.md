---
type: concept
created: 2026-06-15
updated: 2026-06-15
sources:
  - "[[sources/karpathy-llm-wiki-comments]]"
tags: [llm-wiki, harness-design, ontology, meta]
aliases: [typed edges, 타입드 엣지, typed relationships]
---

# Typed edges (타입드 엣지)

> [!summary]
> 위키 페이지 간 관계를 단순 링크가 아니라 **타입을 가진 엣지**로 표현하자는 제안(pursultani, [[sources/karpathy-llm-wiki-comments]]). frontmatter에 contradicts / supports / extends / supersedes 같은 관계 블록을 둔다. 핵심 전제: **모순은 defect가 아니라 콘텐츠**일 수 있다.

## 핵심 주장 (pursultani)

- contradiction을 defect로 보는 기본 인식론은 **객관 도메인용**. 인문·철학에선 모순 자체가 콘텐츠.
- **정책**(어떤 모순을 flag할지)과 **표현**(어떻게 나타낼지)을 혼동하지 마라.
- 해법: frontmatter에 typed relationship 블록 — `contradicts`, `supports`, `extends`, `supersedes` 등.

## 엣지 타입(예시)

| 타입 | 의미 |
|------|------|
| supports | A가 B를 뒷받침 |
| contradicts | A가 B와 충돌 (defect 아님 — 콘텐츠) |
| extends | A가 B를 확장 |
| supersedes | A가 B를 대체 (cf. [[provenance-and-supersede]]) |

## 미해결 난제

- **어휘 거버넌스**: "extends냐 supersedes냐" 판정은 진짜 온톨로지 작업. 누가/어떻게 결정하나.

## 이 vault와의 연결

현재 이 vault는 모순을 `> [!note] 충돌` 블록으로 본문에 병기하고 lint가 후속 처리한다(CLAUDE.md 운영 원칙 3). typed edges는 이 관행을 **frontmatter의 구조화된 관계**로 끌어올리는 진화 경로다.

## 관련

- [[llm-wiki-pattern]] — 상위 패턴.
- [[concurrent-ingest-race-condition]] — 모순을 자동 해결 않고 리뷰 큐로 보내는 동시성 측면.
- [[provenance-and-supersede]] — supersedes 엣지의 시간 차원.

## 열린 질문

- 결정 로그로 확장 시 "decision supersedes decision" 엣지가 핵심이 된다. 엣지 어휘를 어디서 거버넌스할까(schema/CLAUDE.md?).
