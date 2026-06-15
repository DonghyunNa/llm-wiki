---
type: concept
created: 2026-06-15
updated: 2026-06-15
sources:
  - "[[sources/why-nextjs-default-stack]]"
  - "[[sources/against-nextjs-default]]"
tags: [tech-stack, decision]
aliases: [기본 스택, default stack]
---

# default-stack-choice

> [!summary]
> 새 프로젝트마다 기술 스택을 처음부터 고민하지 않기 위해, 특별한 이유가 없는 한 쓰는 "기본값" 스택을 미리 정해 두는 메타 결정 패턴. 결정 비용을 줄이는 출발점이지 절대 규칙은 아니다.

## 패턴

[[sources/why-nextjs-default-stack]]가 보여주는 결정 방식:

- 프레임워크 선택에서 **매번 고민하지 않기 위해** 기본값을 둔다.
- 특별한 이유가 없는 한 그 기본값으로 시작한다 (이 소스에서는 [[nextjs]]).
- 기본값은 **"고민을 줄이는 출발점"이지 "절대 규칙"이 아니다.** 명확한 단서가 있으면 케이스별로 벗어난다.

> "기본값은 '고민을 줄이는 출발점'이지 '절대 규칙'이 아니다." — [[sources/why-nextjs-default-stack]]

## 기본값을 벗어나는 신호 (이 소스의 예)

- 순수 정적 사이트/문서 → 더 가벼운 도구.
- 무거운 실시간/엣지 워크로드, 비-React 선호 팀.
- 모바일 앱 주력.

> [!note] 충돌
> [[sources/why-nextjs-default-stack]]는 기본값이 매번의 고민을 줄여 결정 비용을 낮춰 준다고 함 (고민을 줄이는 출발점).
> [[sources/against-nextjs-default]]는 기본값이 오히려 요구사항 검토를 회피하는 습관·사고 정지를 정당화하고, 정적 블로그·랜딩에까지 Next.js를 얹는 과잉 엔지니어링을 부른다고 함.
> 후속 검토 필요.

## 관련

- [[nextjs]] — 이 소스가 채택한 구체적 기본값.
- [[coding-agent-friendly-stack]] — 기본값을 정당화하는 결정적 근거 축.
- [[fullstack-framework]] — 단일 풀스택 스택이라 결정을 한 번에 줄일 수 있다는 점이 맞물림.
