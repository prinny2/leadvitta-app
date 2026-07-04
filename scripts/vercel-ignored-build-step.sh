#!/usr/bin/env bash
# Configure Vercel's Ignored Build Step command to:
# bash scripts/vercel-ignored-build-step.sh
#
# Vercel Ignored Build Step semantics:
# exit 0 skips the deployment; exit 1 lets the build continue.
exit 1
