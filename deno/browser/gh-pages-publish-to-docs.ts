/**
 * Publish an npm module to github pages
 * by being very opinionated and combining
 * with the cloudseed justfile
 */

import { publishGithubPages } from "./mod.ts";
import { getArgsFromEnvAndCli } from "../env/args_or_env.ts";

const opts = getArgsFromEnvAndCli({
  VERSIONING: false,
});
const { VERSIONING } = opts;

await publishGithubPages({ VERSIONING });
