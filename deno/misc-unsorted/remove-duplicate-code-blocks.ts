/**
 * Workaround for:
 *   https://github.com/souvikinator/notion-to-md/issues/62
 * Removes duplicate mermaid blocks from notion-to-md
 * It's a personal script, it makes a bunch of assumptions
 * because the underlying problem is likely to be fixed eventually
 */
import { walk } from "https://deno.land/std/fs/mod.ts";

const replaceDuplicateCodeBlocks = async (path: string) => {
  let text: string = await Deno.readTextFile(path);
  let modified = false;

  const reg = new RegExp(/(\`\`\`mermaid\n(.*\n)*?\`\`\`\n)/gm);
  let matches;

  while ((matches = reg.exec(text)) !== null) {
    const matchRawText = (matches[0] + "\n\n" + matches[0]).trim();
    const matchRawTextIndex = text.indexOf(matchRawText);
    if (matchRawTextIndex >= 0) {
      console.log(`✅ found doubled mermaid diagram`);
      text = text.replace(matchRawText, matches[0]);
      modified = true;
    }
  }

  if (modified) {
    console.log(`📝 writing modified file: ${path}`);
    await Deno.writeTextFile(path, text);
  }
};

const replaceAllInPath = async (targetPath: string) => {
  for await (const e of walk(targetPath, {
    includeDirs: false,
    exts: [".md", ".mdx"],
  })) {
    if (e.isFile) {
      await replaceDuplicateCodeBlocks(e.path);
    }
  }
};

await replaceAllInPath("./docs");
await replaceAllInPath("./blog");
