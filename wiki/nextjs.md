---
type: entity
created: 2026-06-15
updated: 2026-06-15
sources:
  - "[[sources/why-nextjs-default-stack]]"
  - "[[sources/against-nextjs-default]]"
tags: [nextjs, web-framework, tech-stack, coding-agent]
aliases: [Next.js, NextJS]
---

# nextjs

> [!summary]
> React 기반의 풀스택 메타프레임워크. 프론트엔드 UI와 백엔드 로직(API Routes / Route Handlers, Server Actions, 서버 컴포넌트)을 한 코드베이스에서 다룰 수 있어, 새 웹 프로젝트의 "기본 스택" 후보로 채택된다.

## 왜 기본값으로 두는가

[[sources/why-nextjs-default-stack]]가 정리한 세 가지 근거:

1. **풀스택 적합** — 프론트/백엔드를 한 레포에서. → [[fullstack-framework]]
2. **예시 풍부** — React 생태계의 사실상 표준 메타프레임워크라 문서·예제·검증된 조합(인증·결제·DB·배포)이 압도적으로 많다.
3. **코딩 에이전트 친화** — 예시가 풍부할수록 에이전트가 더 정확하고 관용적인 코드를 낸다. → [[coding-agent-friendly-stack]]

## 언제 Next.js가 아닌가

기본값은 절대 규칙이 아니다. 케이스별로 재검토할 신호:

- 순수 정적 사이트/문서 → Astro 등이 더 가벼울 수 있음.
- 무거운 실시간/엣지 워크로드, 비-React 선호 팀.
- 모바일 앱이 주력인 경우.

(기본값을 두는 것 자체의 논리는 → [[default-stack-choice]])

> [!note] 충돌
> [[sources/why-nextjs-default-stack]]는 Next.js가 풀스택으로 적절하고 백엔드를 점진적으로 분리할 수 있다고 함.
> [[sources/against-nextjs-default]]는 Next.js가 풀스택으로 쓰기엔 무겁고 락인이 강하다고 함 — App Router·RSC·Server Actions의 가파른/잦게 바뀌는 학습 곡선, 백엔드 깊은 결합에 따른 분리 시 재작성 비용, Vercel 락인(셀프호스팅 시 ISR·이미지 최적화·엣지 까다로움).
> 후속 검토 필요.

## 관련

- [[fullstack-framework]] — Next.js가 속하는 프레임워크 범주.
- [[coding-agent-friendly-stack]] — Next.js를 가장 앞세우는 새 선택 축.
- [[default-stack-choice]] — "기본값으로 고민을 줄인다"는 메타 결정.
