# just docs: https://github.com/casey/just
set shell                          := ["bash", "-c"]
set dotenv-load                    := true
# Not using env_var_or_default due to github actions docker permissions issue
ROOT                               := `if [ "${GITHUB_WORKSPACE}" != "" ]; then echo "${GITHUB_WORKSPACE}"; else echo "$(git rev-parse --show-toplevel)"; fi`
export DOCKER_IMAGE_PREFIX         := "ghcr.io/metapages/"
# Always assume our current cloud ops image is versioned to the exact same app images we deploy
export DOCKER_TAG                  := `if [ "${GITHUB_ACTIONS}" = "true" ]; then echo "${GITHUB_SHA}"; else echo "$(git rev-parse --short=8 HEAD)"; fi`
export DOCKER_IMAGE_NAME           := `basename $(pwd)`
# Source of deno scripts. When developing we need to switch this
export DENO_SOURCE                 := env_var_or_default("DENO_SOURCE", "https://deno.land/x/metapages@v0.0.8")
# minimal formatting, bold is very useful
bold                               := '\033[1m'
normal                             := '\033[0m'

_help:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -f /.dockerenv ]; then
        just --list --unsorted --list-heading $'🌱 Commands:\n\n';
    else
        # Hoist into a docker container with all require CLI tools installed
        deno run --unstable --allow-all {{DENO_SOURCE}}/commands/docker/docker_mount.ts --mount-ssh=true --mount-git-config=true  --user=root --image={{DOCKER_IMAGE_PREFIX}}{{DOCKER_IMAGE_NAME}}:{{DOCKER_TAG}} --context="." --dockerfile=Dockerfile --command=bash;
    fi

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
