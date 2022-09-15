import {
  exec as Exec,
  OutputMode,
} from "../exec/mod.ts";

export const ROOT: string = Deno.env.get("ROOT") || "/repo";
export const DEPLOYMENTS_ROOT = `${ROOT}/cloud`;

export type Provider = string;

export const getDeployments = (): string[] => {
  return getDirectoriesSync(DEPLOYMENTS_ROOT).filter((d) => !d.startsWith("."));
};

export const getDirectoriesSync = (root: string): string[] => {
  const directories: string[] = [];
  for (const dirEntry of Deno.readDirSync(root)) {
    if (dirEntry.isDirectory && !dirEntry.name.startsWith(".")) {
      directories.push(dirEntry.name);
    }
  }
  return directories;
};

export const getFilesSync = (root: string): string[] => {
  const files: string[] = [];
  for (const dirEntry of Deno.readDirSync(root)) {
    if (!dirEntry.name.startsWith(".")) {
      files.push(dirEntry.name);
    }
  }
  return files;
};

export const getRepositoryName: () => Promise<string> = async () => {
  // Is this running in Github Actions? Then it tell us the repository name, for example, octocat/Hello-World.
  // https://docs.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables
  if (
    Deno.env.get("GITHUB_ACTIONS") === "true" &&
    Deno.env.get("GITHUB_REPOSITORY") &&
    Deno.env.get("GITHUB_REPOSITORY") !== ""
  ) {
    return Deno.env.get("GITHUB_REPOSITORY") as string;
  }

  const output = await execCapture("git config --get remote.origin.url");
  // output = e.g. git@github.com:myname/myrepo.git
  return output.split(":")[1].replace(".git", "");
};

/**
 * Wrapper around exec so these can be done on a single line in
 * most cases.
 * Env vars are always inherited from the current process
 * since it might call other just commands.
 *
 * @module
 */
export const exec: (
  command: string,
  env?: { [key: string]: string }
) => Promise<string> = async (command, env) => {
  exec;
  const response = await Exec(command, {
    output: OutputMode.StdOut,
    // Allow env overrides
    env: env ?? {},
  });
  if (response.status.code !== 0) {
    console.log(`response.status.code=${response.status.code}`);
    console.log(response);
    throw new Error(`Command failed: ${command}`);
  }
  return response.output;
};

export const execCapture: (
  command: string,
  env?: { [key: string]: string }
) => Promise<string> = async (command, env) => {
  exec;
  const response = await Exec(command, {
    output: OutputMode.Capture,
    // Allow env overrides
    env: { ...Deno.env.toObject(), ...env ?? {}},
    // verbose: true,
  });
  if (response.status.code !== 0) {
    console.log(`response.status.code=${response.status.code}`);
    console.log(response);
    throw new Error(`Command failed: ${command}`);
  }
  return response.output;
};
