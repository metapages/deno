# just docs: https://github.com/casey/just
set shell                          := ["bash", "-c"]
set dotenv-load                    := true
# Source of deno scripts. When developing we need to switch this
export DENO_SOURCE                 := env_var_or_default("DENO_SOURCE", "https://deno.land/x/metapages@v0.0.8")
# minimal formatting, bold is very useful
bold                               := '\033[1m'
normal                             := '\033[0m'
green                              := "\\e[32m"
yellow                             := "\\e[33m"
blue                               := "\\e[34m"
magenta                            := "\\e[35m"
grey                               := "\\e[90m"

@_help:
    just --list --unsorted --list-heading $'🐋 Commands:\n\n';
    echo -e ""
    echo -e "        Github  URL 🔗 {{green}}$(git config --get remote.origin.url | sd ':' '/' | sd 'git@' 'https://' | sd '\.git' ''){{normal}}"
    echo -e "        Publish URL 🔗 {{green}}https://deno.land/x/metapages{{normal}}"
    echo -e '        Example deno:  {{green}}import { thing } from "https://deno.land/x/metapages@v0.0.20/net/mod.ts"'
    
    echo -e ""

# Bump the version and push a git tag (triggers pushing new docker image). inc=major|minor|patch
@publish inc="patch":
    deno run --unstable --allow-all {{DENO_SOURCE}}/commands/publish.ts --increment={{inc}}

test:
    #!/usr/bin/env bash
    set -eo pipefail
    # workaround for github actions docker permissions issue
    if [ "${GITHUB_WORKSPACE}" != "" ]; then
        git config --global --add safe.directory /github/workspace
        export GIT_CEILING_DIRECTORIES=/__w
    fi

    deno test --unstable --allow-run --fail-fast

watch:
    watchexec --exts ts -- just test

@_ensure_inside_docker:
    deno run --unstable --allow-read=/.dockerenv {{DENO_SOURCE}}/commands/docker/is_inside_docker.ts
