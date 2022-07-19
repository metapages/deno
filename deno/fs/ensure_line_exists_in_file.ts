import { ensureLineExistsInFile } from "./mod.ts";
import { getArgsFromEnvAndCli } from "../env/args_or_env.ts";
const { line, file } = getArgsFromEnvAndCli({file:true, line:true});
await ensureLineExistsInFile({line, file});
