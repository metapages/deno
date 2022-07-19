/**
 * Print to stdout the root of the git repo
 */
import { getGitRepositoryRoot } from "./mod.ts";
const root = await getGitRepositoryRoot();
console.log(root);
