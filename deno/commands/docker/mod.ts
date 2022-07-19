import {
  existsSync,
} from "https://deno.land/std@0.130.0/fs/mod.ts";
import { exec, OutputMode } from "../../exec/mod.ts";

export const isInsideDocker: () => boolean = () => {
  return existsSync("/.dockerenv");
};

export const isDockerImage: (image: string) => Promise<boolean> = async (
  image
) => {
  const process = await exec(`docker images -q ${image}`, {
    output: OutputMode.Capture,
  });
  return process.output.trim() !== "";
};

export const buildDockerImage: (opts: {
  tag: string;
  context?: string;
  dockerfile?: string;
}) => Promise<void> = async (opts) => {
  const { tag, dockerfile, context = "." } = opts;
  const process = await exec(`docker build ${dockerfile ? "-f " + dockerfile : ""} -t ${tag} ${context}`, {
    output: OutputMode.StdOut,
  });
  if (!process.status.success) {
    throw new Error(`Failed to build docker image ${tag}`);
  }
};
