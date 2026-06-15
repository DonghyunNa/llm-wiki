---
type: concept
created: 2026-06-15
updated: 2026-06-15
sources:
  - "[[sources/why-nextjs-default-stack]]"
  - "[[sources/against-nextjs-default]]"
tags: [coding-agent, tech-stack, web-framework]
aliases: [에이전트 친화 스택, agent-friendly stack]
---

# coding-agent-friendly-stack

> [!summary]
> 코딩 에이전트(Claude Code 등)가 정확하고 관용적인 코드를 내기 쉬운 기술 스택. 핵심 변수는 **예시의 풍부함** — 학습 데이터·웹 검색·기존 예제 패턴이 많을수록 에이전트가 헛디딜 확률이 낮다. 프레임워크 선택의 새로운 축이다.

## 핵심 논거

[[sources/why-nextjs-default-stack]]의 가장 독창적인 주장:

- 코딩 에이전트는 **학습 데이터·웹 검색·기존 예시 패턴**에 기대어 코드를 생성한다.
- 따라서 예시가 풍부한 프레임워크일수록 에이전트가 더 정확하고 **관용적인(idiomatic)** 코드를 낸다. 흔한 패턴일수록 헛디딜 확률이 낮다.
- 반대로 니치한 프레임워크는 자료 부족으로 에이전트가 **환각하거나 구식 API**를 쓰기 쉽다.

> "예시가 풍부한 프레임워크일수록 에이전트가 더 정확하고 관용적인(idiomatic) 코드를 낸다. 흔한 패턴일수록 에이전트가 헛디딜 확률이 낮다." — [[sources/why-nextjs-default-stack]] §3

## 선택 축의 전환

전통적으로 프레임워크 선택 기준은 "사람에게 익숙한가"였다. 에이전트가 개발의 큰 부분을 맡는 지금, 여기에 **"에이전트가 잘 다루는가"**라는 축이 더해진다. 에이전트와의 생산성이 곧 팀 생산성이 되는 흐름에서, 예시 풍부함은 단순 편의가 아니라 **속도·정확성의 직접 요인**이다.

> [!note] 충돌
> [[sources/why-nextjs-default-stack]]는 예시가 풍부할수록 에이전트가 더 정확하고 관용적인 코드를 낸다고 함 (풍부함 → 정확함).
> [[sources/against-nextjs-default]]는 이 논거가 양날의 검이라고 함 — Next.js는 버전마다 권장 패턴이 크게 바뀌어(Pages Router→App Router) 구식 예시가 대량 혼입되고, 에이전트가 옛 패턴(getServerSideProps)과 새 패턴(RSC)을 뒤섞어 환각한다. 예시가 많다는 건 모순되는 예시도 많다는 뜻이며 "풍부함"이 곧 "정확함"은 아니다. 오히려 API 표면이 작고 안정적인 프레임워크(SvelteKit, Remix 일부 버전)가 더 일관된 코드를 낼 수 있다.
> 후속 검토 필요.

## 관련

- [[nextjs]] — 이 축에서 가장 앞선 사례로 제시됨. React 생태계 표준이라 예시가 압도적.
- [[default-stack-choice]] — 에이전트 친화성이 기본 스택 선정의 결정적 근거가 된다.

## 열린 질문

- "예시 풍부함"을 어떻게 측정하나? (검색 결과 수, 벤치마크에서의 에이전트 성공률 등) — 소스는 정성적 주장에 머문다.
- 에이전트 학습 데이터가 갱신되면서 한때 니치하던 스택이 친화 스택으로 바뀔 수 있나? — 시간축 효과는 미탐색.
