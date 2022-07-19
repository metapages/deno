// utilities for publishing npm modules
import * as path from "https://deno.land/std@0.83.0/path/mod.ts";
import { printf } from "https://deno.land/std@0.83.0/fmt/printf.ts";
import * as colors from "https://deno.land/std@0.83.0/fmt/colors.ts";

export const readJsonFile :<T>(filePath :string) => Promise<T> = async (filePath) => {
    const jsonBlob = await Deno.readTextFile(filePath);
    return JSON.parse(jsonBlob);
}

export interface CommandResult {
    exitCode:number;
    stdout ?:string;
    stderr ?:string;
}

export const command :(args :{cmd :string[], cwd ?:string, pipeToDeno ?:boolean}) => Promise<CommandResult> = async (args) => {
    let { cmd, cwd, pipeToDeno} = args;
    if (pipeToDeno === undefined) pipeToDeno = true;
    printf(colors.bold(cmd.join(' ') + '\n'));
    const process = Deno.run({
        cmd :cmd,
        cwd :cwd,
        stdout: 'piped',
        stderr: 'piped',
    });
    const status = await process.status();
    const result :CommandResult = { exitCode: status.code };
    if (status.code === 0) {
        const output = await process.output();
        result.stdout = new TextDecoder().decode(output);
        if (pipeToDeno) {
            console.log(result.stdout);
        }
    } else {
        const output = await process.stderrOutput();
        result.stderr = new TextDecoder().decode(output);
        if (pipeToDeno) {
            console.error(result.stderr);
        }
    }
    return result;
}

export interface NpmPublishArgs {
    cwd :string;
    npmToken:string;
}
/**
 * Point at a directory containing the assets ready to publish
 */
export const npmPublish :(args:NpmPublishArgs) => Promise<CommandResult> = async (args) => {
    const {cwd, npmToken} = args;
    console.log('cwd', cwd);
    const packageJson :{version:string} = await readJsonFile(path.join(cwd, 'package.json'));
    printf(colors.bold(`PUBLISHING npm version ${packageJson.version}\n`));
    await Deno.writeTextFile(path.join(cwd, '.npmrc'), `//registry.npmjs.org/:_authToken=${npmToken}`);
    return await command({cmd:['npm', 'publish', '.'], cwd});
}

export const npmVersion :(args :{cwd:string, npmVersionArg:string}) => Promise<CommandResult> = async (args) => {
    const {cwd, npmVersionArg} = args;
    const result = await command({cmd:['npm', 'version'].concat(npmVersionArg ? [npmVersionArg] : []), cwd});
    if (result.exitCode !== 0) {
        Deno.exit(result.exitCode);
    }
    return result;
}
