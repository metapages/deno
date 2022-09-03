import { failIfGitUncommittedFiles } from "./mod.ts";

await failIfGitUncommittedFiles();
