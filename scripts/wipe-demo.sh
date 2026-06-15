#!/usr/bin/env bash
#
# wipe-demo.sh — Next.js 데모 데이터를 한 번에 제거한다.
#
# 이 저장소는 llm-wiki 하네스의 레퍼런스 + 효용을 보여주는 데모로 배포된다.
# 데모를 둘러본 뒤 자기 도메인으로 시작하려면 이 스크립트를 "한 번" 실행하라.
#
#   bash scripts/wipe-demo.sh
#
# 지우는 것: Next.js 기본 스택 데모 (wiki 페이지 4 + source 2 + raw 2)
#            + index.md의 "Tech Stack" 카테고리 + log.md의 Next.js 항목.
# 남기는 것: Karpathy LLM Wiki 패턴 메타 페이지 5종 (실제로 쓸모 있는 레퍼런스),
#            하네스 전체(.claude/, CLAUDE.md), index/log 골격.
#
# 실행이 끝나면 이 스크립트는 자기 자신을 삭제한다 — 실수로 두 번 돌지 않게.

set -euo pipefail

# 저장소 루트 = 이 스크립트의 부모 디렉토리의 부모
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
ROOT="$(cd "$(dirname "$SCRIPT_PATH")/.." && pwd)"
cd "$ROOT"

WIKI="wiki"
RAW="raw"

# 데모로 분류되어 삭제될 파일 목록
DEMO_WIKI_PAGES=(
  "$WIKI/nextjs.md"
  "$WIKI/fullstack-framework.md"
  "$WIKI/coding-agent-friendly-stack.md"
  "$WIKI/default-stack-choice.md"
)
DEMO_SOURCES=(
  "$WIKI/sources/why-nextjs-default-stack.md"
  "$WIKI/sources/against-nextjs-default.md"
)
DEMO_RAW=(
  "$RAW/why-nextjs-default-stack.md"
  "$RAW/against-nextjs-default.md"
)

echo "이 스크립트는 Next.js 데모 데이터를 제거합니다 (Karpathy 메타 페이지는 남깁니다)."
echo
echo "삭제될 파일:"
printf '  %s\n' "${DEMO_WIKI_PAGES[@]}" "${DEMO_SOURCES[@]}" "${DEMO_RAW[@]}"
echo "  + ${WIKI}/index.md 의 'Tech Stack' 카테고리"
echo "  + ${WIKI}/log.md 의 Next.js ingest/lint 항목"
echo "  + 이 스크립트 자신 (scripts/wipe-demo.sh)"
echo
read -r -p "계속하시겠습니까? (yes 입력 시 진행) " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "취소됨. 아무것도 변경하지 않았습니다."
  exit 0
fi

# 1) 데모 파일 삭제 (없어도 에러 안 나게 -f)
rm -f "${DEMO_WIKI_PAGES[@]}" "${DEMO_SOURCES[@]}" "${DEMO_RAW[@]}"

# 2) index.md 에서 "Tech Stack" 카테고리 블록 제거 (## Tech Stack ... 다음 ## 직전까지)
#    그리고 Sources 목록의 Next.js 소스 두 줄 제거
python3 - "$WIKI/index.md" <<'PY'
import sys, re
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
# "## Tech Stack ..." 헤딩부터 다음 "## " 헤딩 직전까지 통째로 제거
s = re.sub(r"\n## Tech Stack[^\n]*\n.*?(?=\n## )", "\n", s, flags=re.DOTALL)
# Sources 목록의 Next.js 관련 줄 제거
s = "\n".join(
    ln for ln in s.split("\n")
    if "why-nextjs-default-stack" not in ln and "against-nextjs-default" not in ln
)
open(p, "w", encoding="utf-8").write(s)
PY

# 3) log.md 에서 Next.js 관련 ## 항목 블록 제거
python3 - "$WIKI/log.md" <<'PY'
import sys, re
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
# 제목에 Next.js 가 든 로그 항목 블록 제거 (## [..] ... 다음 ## 직전까지)
s = re.sub(r"\n## \[[^\]]*\][^\n]*Next\.js[^\n]*\n.*?(?=\n## |\Z)", "\n", s, flags=re.DOTALL)
# Next.js lint 항목(P0:4 ...)도 데모 산물이므로 제거: 본문에 nextjs 링크가 있는 lint 블록
s = re.sub(r"\n## \[[^\]]*\] lint[^\n]*\n(?:(?!\n## ).)*?nextjs.*?(?=\n## |\Z)", "\n", s, flags=re.DOTALL)
s = re.sub(r"\n{3,}", "\n\n", s)
open(p, "w", encoding="utf-8").write(s)
PY

# 4) 빈 sources 디렉토리 정리는 하지 않음 (karpathy 소스가 남아 있음)

echo
echo "✅ Next.js 데모 제거 완료."
echo "   남은 것: Karpathy LLM Wiki 패턴 메타 페이지 + 하네스."
echo "   이제 CLAUDE.md 의 ## Domain 을 자기 도메인으로 바꾸고 ingest를 시작하세요."

# 5) 자기 자신 삭제 — 두 번 실행 방지
rm -f "$SCRIPT_PATH"
# scripts/ 디렉토리가 비면 함께 제거
rmdir "$(dirname "$SCRIPT_PATH")" 2>/dev/null || true
echo "   (이 스크립트는 자신을 삭제했습니다.)"
