import * as Colors from "https://deno.land/std@0.83.0/fmt/colors.ts ";
import { printf } from "https://deno.land/std@0.83.0/fmt/printf.ts";
import { exec, OutputMode } from "../exec/mod.ts";
import { execCapture } from "../commands/mod.ts";

export const getGithubPackagePage = async (): Promise<string> => {
  const originUrl = await execCapture("git remote get-url origin");
  let projectUrl = originUrl.replace("git@github.com:", "");
  projectUrl = projectUrl.replace(".git", "");
  return `https://github.com/${projectUrl}/settings/pages`;
};

export const getGitSha = async ({
  short,
}: {
  short?: number;
}): Promise<string> => {
  // Is this running in Github Actions? Then the repository name is the env var is e.g. GITHUB_REPOSITORY=octocat/Hello-World
  // https://docs.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables
  if (Deno.env.get("GITHUB_ACTIONS") === "true" && Deno.env.get("GITHUB_SHA")) {
    if (short) {
      return Deno.env.get("GITHUB_SHA")!.substr(0, short);
    } else {
      return Deno.env.get("GITHUB_SHA")!;
    }
    // otherwise try just using git, last resort because it may not be installed or the repo is a shallow clone
  } else {
    const result = await exec("git rev-parse HEAD", {
      output: OutputMode.Capture,
      continueOnError: false,
      printCommand: false,
    });
    if (!result.status.success) {
      console.error(result.output);
      throw result;
    }
    // result.output = e.g. git@github.com:myname/myrepo.git
    const sha = result.output;
    if (short) {
      return sha.substr(0, short);
    } else {
      return sha;
    }
  }
};

export const failIfGitUncommittedFiles: () => Promise<void> = async () => {
  const unCommittedFiles = await uncommittedFiles();
  if (unCommittedFiles.length > 0) {
    printf(Colors.red(`❗ Uncommitted git files\n`));
    printf(Colors.red(`${unCommittedFiles.join('\n\t')}`));
    Deno.exit(1);
  }
};

export const uncommittedFiles: () => Promise<string[]> = async () => {
    const result = await exec("git status --untracked-files=no --porcelain", {
      output: OutputMode.Capture,
      continueOnError: false,
      printCommand: false,
    });
    if (result.output && result.output.length > 0) {
        return result.output.split("\n").map((line) => line.trim());
    } else {
        return [];
    }
  };

export const getGitRepositoryRoot: () => Promise<string> = async () => {
  if (
    Deno.env.get("GITHUB_WORKSPACE") &&
    Deno.env.get("GITHUB_WORKSPACE") !== ""
  ) {
    return Deno.env.get("GITHUB_WORKSPACE") as string;
  }

  const result = await exec("git rev-parse --show-toplevel", {
    output: OutputMode.Capture,
    continueOnError: false,
    printCommand: false,
  });
  if (!result.status.success) {
    throw result;
  }

  return result.output;
};
