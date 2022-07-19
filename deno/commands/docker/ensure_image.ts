import { getArgsFromEnvAndCli } from "../../env/args_or_env.ts";
import { isDockerImage, buildDockerImage } from "./mod.ts";

const { image, context = "." } = getArgsFromEnvAndCli({
  image: true,
  context: false,
});
const isImage = await isDockerImage(image);
if (isImage) {
  Deno.exit(0);
}

await buildDockerImage({ tag: image, context });
