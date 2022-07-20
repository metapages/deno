import * as semver from "https://deno.land/x/semver@v1.4.0/mod.ts";
import { existsSync } from "https://deno.land/std@0.130.0/fs/mod.ts";
import { exec, OutputMode } from "https://deno.land/x/exec@0.0.5/mod.ts";
import { getArgsFromEnvAndCli } from "../env/args_or_env.ts";
import {isInsideDocker } from "./docker/mod.ts";
import { ensureDirSync } from "https://deno.land/std@0.130.0/fs/mod.ts";

const opts = getArgsFromEnvAndCli({
    CI: false,
    APP_FQDN: "metaframe1.dev",
  });

if (opts.CI === "true") {
    console.log("CI=true ∴ skipping mkcert");
    Deno.exit(0);
}

if (isInsideDocker()) {
    console.log("Inside docker context, assuming mkcert has been run on the host");
    Deno.exit(0);
}

//let response = await exec('git ls-remote --tags origin', {output: OutputMode.Capture});
let response = await exec("command -v mkcert", {
    output: OutputMode.Capture,
});
if (response.status.code !== 0) {
    console.log("💥 %cmkcert%c💥 is not installed and is required for running the development server with https",  "font-weight: bold", "");
    console.log("👉 install instructions: https://github.com/FiloSottile/mkcert");
    Deno.exit(1);
}

if (!existsSync(`.certs/${opts.APP_FQDN}-key.pem`)) {
    ensureDirSync(".certs");
    Deno.chdir(".certs");
    response = await exec(`mkcert -cert-file ${opts.APP_FQDN}.pem -key-file ${opts.APP_FQDN}-key.pem ${opts.APP_FQDN} localhost`, {
        output: OutputMode.Capture,
    });
    if (response.status.code !== 0) {
        console.log("💥 %cmkcert failure%c💥",  "font-weight: bold");
        console.log(`%c${response.output}`,  "color: red");
        Deno.exit(1);
    }
    console.log(`👉 mkcert generated http certificates in ./certs`);
}

const etchosts = await Deno.readTextFile("/etc/hosts");
if (!etchosts.includes(opts.APP_FQDN)) {
    console.log(`💥 %c/etc/hosts%c does not include %c${opts.APP_FQDN}`, "font-weight: bold", "", "font-weight: bold");
    console.log(`💥 Add below to /etc/hosts with this command: %csudo vi /etc/hosts%c 💥`, "font-weight: bold");
    console.log("");
    console.log(`%c127.0.0.1       ${opts.APP_FQDN}`, "font-weight: bold");
    console.log("");
    Deno.exit(1);
}
console.log(`✅ Local mkcert certificates and /etc/hosts contains: 127.0.0.1       ${opts.APP_FQDN}`);
