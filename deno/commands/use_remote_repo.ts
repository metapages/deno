/**
 * Use a remote copy of this repo for development
 * 1. Remove the env var `DENO_SOURCE` in the root `.env` file.
 *    This will make all deno scripts use the remote repo.
 */

import { join } from "https://deno.land/std@0.130.0/path/mod.ts";
import { getGitRepositoryRoot } from "../git/mod.ts";
import { removeLineInFile } from "../fs/mod.ts";

// Make sure the git repo is cloned to the local folder
const gitRoot = await getGitRepositoryRoot();

await removeLineInFile({
  file: join(gitRoot, ".env"),
  regex: new RegExp("^DENO_SOURCE=.*"),
});
