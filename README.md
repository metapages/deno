# Deno scripts for build/test/deploy/misc operations

This repo stores scripts used for build/test/deploy commands for hundreds of repositories.

## Overview

Problem: sharing and versioning code for dev/ops, those useful scripts etc is hard.

The magic trifecta for managing hundreds of git repositories efficiently, with versioning, and a great UX for ops/development is:

 - [deno](https://deno.land/): for code and scripts and servers and all that good stuff
   - 👍 Single binary and URL imports and typing
 - [just](https://github.com/casey/just): for command line menus and commands
   - 💍 One command runner for everything
 - (optional) [docker](https://docs.docker.com/): run stacks, don't require host installs (mitigated by deno above)

### Pattern

Each repository has a `justfile` in the root with some set of core commands:

 - build
 - test
 - publish/deploy


That way, I can go to any repository, and have the minimum set of commands to make updates, fixes, and publish or deploy. The tools are standardized, not dependent on a particular framework or language, and each tool is very good at what it does.
