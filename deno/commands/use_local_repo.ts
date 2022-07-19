/**
 * Use a local copy of this repo for development
 * 1. Check out the repo https://github.com/metapages/deno at: {path} (default: `.tmp/git/metapages/deno`)
 * 2. Change/add the env var `DENO_SOURCE` in `.env` files to point to the above repo, so
 *    that [just](https://github.com/casey/just) files will consume the updated reference,
 *    and point all deno scripts to the local git repo.
 * 3. Edit and update
 * 4. After: make a PR with the new changes
 */

import { join, dirname } from "https://deno.land/std@0.130.0/path/mod.ts";
import {
  ensureDirSync,
  existsSync,
} from "https://deno.land/std@0.130.0/fs/mod.ts";
import { exec, OutputMode } from "../exec/mod.ts";
import { getGitRepositoryRoot } from "../git/mod.ts";
import { ensureLineExistsInFile } from "../fs/mod.ts";
import { getArgsFromEnvAndCli } from "../env/args_or_env.ts";

// If we are given a path, use that and set as DENO_SOURCE
const { path }:{path:string|undefined} = getArgsFromEnvAndCli({path:false})

let denoGitDir = path;
const gitRoot = await getGitRepositoryRoot();

if (!denoGitDir) {
  // Make up a local path for the repo
  const repoCloneRoot = join(gitRoot, ".tmp/git/metapages");
  denoGitDir = join(repoCloneRoot, "deno");
}
// Make sure the git repo is cloned to the local folder
if (!existsSync(denoGitDir)) {
  ensureDirSync(dirname(denoGitDir));
  const process = await exec(
    "git clone https://github.com/metapages/deno",
    { cwd: dirname(denoGitDir), output: OutputMode.Tee }
  );
}

await ensureLineExistsInFile({
  file: join(gitRoot, ".env"),
  line: `DENO_SOURCE=${denoGitDir}/deno`,
});
