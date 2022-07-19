import {join, parse} from "https://deno.land/std@0.130.0/path/mod.ts";
import {
  ensureFile,
  existsSync,
} from "https://deno.land/std@0.130.0/fs/mod.ts";

/**
 * Return the first file found with the given prefix, in the current directory,
 * and continuing searching into the parent down to the root.
 * @param prefix
 */
export const getNearestFileWithPrefix = (prefix : string, root? : string | undefined): string | undefined => {
  let current = root
    ? root
    : Deno.cwd();
  let found: string | undefined = undefined;
  while (!found) {
    for (const dirEntry of Deno.readDirSync(current)) {
      if (dirEntry.name.startsWith(prefix)) {
        found = join(current, dirEntry.name);
        break;
      }
    }
    // not found
    const parsedPath = parse(current);
    // at the root
    if (parsedPath.dir === current) {
      return;
    }
    current = parsedPath.dir;
  }
  return found;
};

export const getPathDirectories = (path :string) :string[] => {
  return Array.from(Deno.readDirSync(path)).filter((fileInfo) => {
    return fileInfo.isDirectory && !fileInfo.name.startsWith('.');
  }).map(f => f.name);
}

export const ensureLineExistsInFile: (args:{file: string, line: string}) => Promise<boolean> = async ({
  file,
  line
}) => {
  await ensureFile(file);
  const text = await Deno.readTextFile(file);
  const lines = text.split('\n');
  if (lines.includes(line)) {
    return false;
  }
  lines.push(line);
  await Deno.writeTextFile(file, lines.join("\n"));
  return true;
}

export const removeLineInFile: (args:{file: string, regex: RegExp}) => Promise<boolean> = async ({
  file,
  regex
}) => {
  if (!existsSync(file)) {
    return false;
  }
  const text = await Deno.readTextFile(file);
  let lines = text.split('\n');
  lines = lines.filter(l => !regex.test(l));
  await Deno.writeTextFile(file, lines.join("\n"));
  return true;
}
