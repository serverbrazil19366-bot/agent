#!/usr/bin/env bash
# Builds the portfolio and pushes the public files to the repo Netlify deploys
# from (serverbrazil19366-bot/Portfolio-, branch main).
#
#   scripts/publish.sh "Commit message"
#
# Expects that repo cloned at $LIVE_REPO (default /home/user/portfolio-).
set -euo pipefail
cd "$(dirname "$0")/.."
LIVE_REPO="${LIVE_REPO:-/home/user/portfolio-}"
MSG="${1:-Update portfolio}"

python3 scripts/build.py

git -C "$LIVE_REPO" pull --ff-only origin main
find "$LIVE_REPO" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -r *.html favicon.ico robots.txt sitemap.xml llms.txt netlify.toml [0-9a-f]*.txt css js assets work "$LIVE_REPO"/

cd "$LIVE_REPO"
git add -A
if git diff --cached --quiet; then
    echo "Nothing changed on the live site."
    exit 0
fi
git commit -q -m "$MSG" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01NT32gBzirvy2Ba5PGYfNQt"
git push origin main
echo "Pushed. Netlify will publish in about a minute."
