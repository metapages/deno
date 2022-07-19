import { isInsideDocker } from "./mod.ts";

if (!isInsideDocker()) {
  throw "🌵🔥🌵🔥🌵🔥🌵 Not inside a docker container. First run the command: 'just' 🌵🔥🌵🔥🌵🔥🌵";
}
