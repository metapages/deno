// utilities for building and publishing a website to github pages
import * as Colors from 'https://deno.land/std@0.153.0/fmt/colors.ts ';
import { join } from "https://deno.land/std@0.153.0/path/mod.ts";
import {
  ensureDir,
  ensureDirSync,
  walk,
} from "https://deno.land/std@0.153.0/fs/mod.ts";
import { getPackageJson } from "../npm/mod.ts";
import { exec, execCapture } from "../commands/mod.ts";
import { getGitRepositoryRoot, getGithubPackagePage, uncommittedFiles, failIfGitUncommittedFiles } from "../git/mod.ts";

/**
 * Uses vite to build the web app into a <root/docs> directory
 * for github pages
 * https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
 */
export const publishGithubPages: (args:{VERSIONING?:string}) => Promise<void> = async ({VERSIONING}) => {

  await failIfGitUncommittedFiles();

  const ROOT = await getGitRepositoryRoot();
  const OUTDIR = join(ROOT, "docs");
  // Mostly CURRENT_BRANCH should be main, but maybe you are testing on a different branch
  let CURRENT_BRANCH = await execCapture("git rev-parse --abbrev-ref HEAD");
  CURRENT_BRANCH = CURRENT_BRANCH.trim();
  const githubBranchListing = await execCapture("git branch --list gh-pages");
  // create gh-pages branch if it doesn't exist
  if (!githubBranchListing.includes("gh-pages")) {
    await exec("git checkout -b gh-pages");
  } else {
    await exec("git checkout gh-pages");
  }
  await exec(
    `git rebase --strategy recursive --strategy-option theirs ${CURRENT_BRANCH}`
  );

  // github pages serves from <domain.com>/<package/<site>
  // so the build needs to know that it is not served from
  // the root of the domain
  const packageJson = await getPackageJson();
  // @metapages/metaframe-editor => metaframe-editor
  const tokens = packageJson.name.split("/");
  const BASE = tokens[tokens.length - 1];
  if (VERSIONING) {
    await buildWithVite({ BASE:join(BASE, `v${packageJson.version}`), OUTDIR:join(OUTDIR,`v${packageJson.version}`) });
  }
  await buildWithVite({ BASE, OUTDIR });

  // If we are NOT a previous version (ie we are the root main app)
  // then generate the index.html file for the versions dir
  if (VERSIONING) {
    await buildIndexForVersions({OUTDIR});
  }

  await exec(`git add --all --force ${OUTDIR}`);

  const unCommittedFiles = await uncommittedFiles();
  if (unCommittedFiles.length > 0) {
    await exec(`git commit -m "site v${packageJson.version}"`);
  } else {
    console.log(`👀 No changes to commit`);
  }

  await exec("git push -uf origin gh-pages");
  await exec(`git checkout ${CURRENT_BRANCH}`);

  const githubProjectUrl = await getGithubPackagePage();

  console.log(`👉 Github configuration (once): 🔗 ${githubProjectUrl}/settings/pages`);
  console.log(`  - ${Colors.green("Source")}`);
  console.log(`    - ${Colors.green("Branch")}: gh-pages 📁 /docs`);
};

type BuildWithViteOptions = {
  OUTDIR: string;
  BASE?: string;
  CERT_FILE?: string;
  CERT_KEY_FILE?: string;
  HOST?: string;
  PORT?: string;
  VERSIONING?: string;
} & Record<string, string>;

/**
 * Cleans the OUTDIR except for previous build versions in <OUTDIR>/v<semver>
 * then builds with vite passing env vars.
 * The important env vars for builds with vite.config.ts are: BASE,OUTDIR
 * @module
 */
export const buildWithVite: (args?: BuildWithViteOptions) => Promise<void> = async (args) => {

  // github pages serves from <domain.com>/<package/<site>
  // so the build needs to know that it is not served from
  // the root of the domain
  const packageJson = await getPackageJson();

  const { OUTDIR = Deno.env.get("OUTDIR") ?? "dist", BASE = Deno.env.get("BASE") ?? ""} = args || {};
  const VERSIONING = !!(args?.VERSIONING === "true");
  if (VERSIONING) {
    await buildWithViteInternal({ BASE:join(BASE, `v${packageJson.version}`), OUTDIR:join(OUTDIR,`v${packageJson.version}`) });
  }
  await buildWithViteInternal({ BASE, OUTDIR });

  // If we are NOT a previous version (ie we are the root main app)
  // then generate the index.html file for the versions dir
  if (VERSIONING) {
    await buildIndexForVersions({OUTDIR});
  }
};


export const buildWithViteInternal: (args?: BuildWithViteOptions) => Promise<void> = async (args) => {
  const OUTDIR = args?.OUTDIR ?? (Deno.env.get("OUTDIR") ?? "dist");
  ensureDirSync(OUTDIR);

  // Make sure the directory is empty EXCEPT for possible existing versions
  // ie immediate child directories named v<version>
  // actually just the assets dir
  for await (const file of walk(OUTDIR, { includeDirs: true, maxDepth: 1 })) {
    if (file.isDirectory) {
      if (file.name === "assets") {
        await Deno.remove(file.path, { recursive: true });
      }
    } else {
      await Deno.remove(file.path);
    }
  }
  const env = { ...Deno.env.toObject(), ...args};
  console.log('env', env);
  await exec("./node_modules/vite/bin/vite.js build --mode=production", env);
};
/**
 * Creates ./docs/v/index.html with all the standalone previuos versions
 */
export const buildIndexForVersions: (args?: {
  OUTDIR?: string;
}) => Promise<void> = async (args) => {
  const { OUTDIR = Deno.env.get("OUTDIR") ?? "dist" } = args ?? {};
  console.log('buildIndexForVersions OUTDIR', OUTDIR);

  await ensureDir(`${OUTDIR}/v`);
  let indexHtml =
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><title>versions</title></head><body><ul>';

  for await (const dirEntry of Deno.readDir(`${OUTDIR}/v`)) {
    if (dirEntry.isDirectory) {
      indexHtml += `<li><a href="${dirEntry.name}/">${dirEntry.name}</a></li>`;
    }
    console.log(dirEntry);
  }
  indexHtml += `</ul></body></html>`;

  const indexFilePath = `${OUTDIR}/v/index.html`;
  await Deno.writeTextFile(indexFilePath, indexHtml);
  console.log(`👉 Generated versions index.html: ${indexFilePath}`);
};
