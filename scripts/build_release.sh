#!/usr/bin/env bash
set -euo pipefail
ENTRY=./src/index.js
OUTDIR=.dist
mkdir -p "$OUTDIR"
TARGETS=(
  bun-linux-x64            # Linux x86_64 glibc
  bun-linux-x64-musl       # Linux x86_64 musl (Alpine)
  bun-linux-arm64          # Linux arm64 (servers / Pi)
  bun-linux-arm64-musl     # Linux arm64 musl
  bun-darwin-x64           # macOS Intel
  bun-darwin-arm64         # macOS Apple Silicon
  bun-windows-x64          # Windows x86_64
)
echo "Building ConteXo binaries into $OUTDIR …"
for TARGET in "${TARGETS[@]}"; do
  BASENAME="contexo-${TARGET}"
  # add .exe extension for Windows targets
  if [[ "$TARGET" == bun-windows* ]]; then
    OUTFILE="$OUTDIR/${BASENAME}.exe"
  else
    OUTFILE="$OUTDIR/${BASENAME}"
  fi

  echo " • $TARGET → $(basename "$OUTFILE")"
  bun build --compile --minify --sourcemap --target=$TARGET "$ENTRY" --outfile "$OUTFILE"

done

echo "AAAll binaries are available in $OUTDIR"
