/**
 * Publish an npm module to github pages
 * by being very opinionated and combining
 * with the cloudseed justfile
 */

import { publishGithubPages } from "./mod.ts";
import { getArgsFromEnvAndCli } from "../env/args_or_env.ts";

const { VERSIONING, BASE } = getArgsFromEnvAndCli({
  // Keep previous versions, create a versioned version of this page (at BASE/v<semver>)
  VERSIONING: false,
  // github pages serves from "https://<github org or username>.github.io>/<package>"
  // for for github pages BASE must be <package>
  BASE: false,
});

await publishGithubPages({ VERSIONING, BASE });
