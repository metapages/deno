import { buildWithVite } from "./mod.ts";
import { getArgsFromEnvAndCli } from "../env/args_or_env.ts";

console.log("DEPLOY_TARGET", Deno.env.get("DEPLOY_TARGET"));

const opts = getArgsFromEnvAndCli({
  VERSIONING: false,
  OUTDIR: false,
  // github pages serves from "https://<github org or username>.github.io>/<package>"
  // for for github pages BASE must be <package>
  BASE: false,
});

await buildWithVite(opts);
