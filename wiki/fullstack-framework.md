---
type: concept
created: 2026-06-15
updated: 2026-06-15
sources:
  - "[[sources/why-nextjs-default-stack]]"
  - "[[sources/against-nextjs-default]]"
tags: [web-framework, tech-stack, fullstack]
aliases: [풀스택 프레임워크, full-stack framework]
---

# fullstack-framework

> [!summary]
> 프론트엔드 UI와 백엔드 로직을 하나의 코드베이스에서 다루는 웹 프레임워크. 별도의 백엔드 서버 없이 API 엔드포인트·데이터 페칭·서버 로직(인증·세션·DB 접근)을 프론트와 같은 레포에서 관리한다.

## 왜 유용한가

[[sources/why-nextjs-default-stack]]가 정리한 이점:

- API 엔드포인트를 같은 프로젝트 안에 둔다.
- 서버 컴포넌트(RSC)로 데이터 페칭을 서버에서 처리한다.
- 인증·세션·DB 접근 같은 서버 로직을 프론트와 같은 레포에서 관리한다.

작은 팀·1인 개발에서 "프론트 레포 / 백엔드 레포"를 따로 운영하는 부담을 줄인다. MVP를 빠르게 세우고, 필요해지면 백엔드를 분리하는 **점진적 경로**가 자연스럽다.

> [!note] 충돌
> [[sources/why-nextjs-default-stack]]는 풀스택 단일 코드베이스가 적절하며, 필요해지면 백엔드를 분리하는 점진적 경로가 자연스럽다고 함.
> [[sources/against-nextjs-default]]는 백엔드를 프레임워크에 두면 깊게 결합되어 무겁고 락인이 강하며, 분리 시 재작성 비용이 커서 "점진적 분리"는 말처럼 쉽지 않다고 함 (풀스택 불필요 프로젝트엔 Vite+React SPA·전용 백엔드가 더 단순).
> 후속 검토 필요.

## 관련

- [[nextjs]] — 이 범주의 대표 사례. 풀스택 적합성은 Next.js를 기본 스택으로 두는 축 1.
- [[default-stack-choice]] — 풀스택이라 단일 스택으로 결정을 줄일 수 있다는 점이 기본값 선택과 맞물린다.
