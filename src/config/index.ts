import { models } from "@/types";
import { examplePrompts } from "./example-prompts";
import { links } from "./links";
import { defaultPreferences } from "./preferences";

const configs = {
  ...links,
  ollamaTagsEndpoint: "/api/tags",
};

export { configs, defaultPreferences, examplePrompts, models };
