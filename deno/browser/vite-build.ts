import { buildWithVite } from "./mod.ts";
import { getArgsFromEnvAndCli } from "../env/args_or_env.ts";

const opts = getArgsFromEnvAndCli({
  VERSIONING: false,
  OUTDIR: false,
  BASE: false,
});

await buildWithVite(opts);
