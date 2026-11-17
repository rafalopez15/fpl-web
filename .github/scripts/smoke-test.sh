#!/usr/bin/env bash
# Request a deployed web app and fail unless it answers like a working one.
#
#     .github/scripts/smoke-test.sh https://fpl-web-kappa.vercel.app
set -uo pipefail

base="${1:?usage: smoke-test.sh <deployment url>}"
case "$base" in
  http*) ;;
  *) base="https://$base" ;; # Vercel's payload may send the host without a scheme
esac
base="${base%/}"
body=$(mktemp)
trap 'rm -f "$body"' EXIT

# Retries cover a cold start and a deployment whose alias is still settling. No
# --location: Vercel's login page, where a protected deployment redirects, is Next.js too.
# Prints the status and, for a redirect, where it points.
fetch() {
  curl --silent --show-error --retry 3 --retry-delay 5 --retry-all-errors \
    --max-time 20 --output "$body" --write-out '%{http_code} %{redirect_url}' "$base$1"
}

failed=0
check() {
  local path=$1 text=$2 status location
  read -r status location <<<"$(fetch "$path")"
  # Follows one redirect within the deployment (/ to /leagues), never to another host.
  if [[ $status == 30[1278] && $location == "$base"/* ]]; then
    path="$path → ${location#"$base"}"
    read -r status location <<<"$(fetch "${location#"$base"}")"
  fi
  if [ "$status" = 200 ] && grep -q "$text" "$body"; then
    echo "ok    $path"
  else
    echo "FAIL  $path: HTTP $status, expected 200 and \"$text\""
    head -c 500 "$body" 2>/dev/null
    echo
    failed=1
  fi
}

# Every Next.js page loads assets from here; Vercel's error pages don't. Not /, which
# redirects.
check /leagues "/_next/static/"

exit $failed
