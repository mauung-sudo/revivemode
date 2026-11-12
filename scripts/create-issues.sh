#!/usr/bin/env bash
# Creates labels, milestones and issues from docs/ROADMAP.md on GitHub,
# then adds them to a GitHub Project.
# Usage: scripts/create-issues.sh <owner/repo> <project-number>
# Needs: gh auth login, plus `gh auth refresh -s project` for project access.
set -euo pipefail
REPO="$1"; PROJECT="$2"
OWNER="${REPO%%/*}"

for l in frontend emulation backend infra content design legal; do
  gh label create "$l" --repo "$REPO" --force >/dev/null
done

milestone=""
while IFS= read -r line; do
  if [[ "$line" =~ ^##\ (Milestone.*)$ ]]; then
    milestone="${BASH_REMATCH[1]}"
    gh api "repos/$REPO/milestones" -f title="$milestone" >/dev/null 2>&1 || true
  elif [[ "$line" =~ ^-\ \[\ \]\ (.*)$ ]]; then
    rest="${BASH_REMATCH[1]}"
    title="$(echo "$rest" | sed -E 's/ *`[^`]+`//g')"
    labels="$(echo "$rest" | grep -oE '`[^`]+`' | tr -d '`' | paste -sd, -)"
    url="$(gh issue create --repo "$REPO" --title "$title" --body "From docs/ROADMAP.md — $milestone" \
      --label "$labels" --milestone "$milestone")"
    gh project item-add "$PROJECT" --owner "$OWNER" --url "$url" >/dev/null
    echo "created: $title"
  fi
done < "$(dirname "$0")/../docs/ROADMAP.md"
