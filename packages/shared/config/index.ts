import { models } from "@repo/shared/types";
import { constants } from "./constants";
import { docs } from "./docs";
import { examplePrompts } from "./example-prompts";
import { examples } from "./examples";
import { links } from "./links";
import { allPlugins, ollamaModelsSupportsTools, providers } from "./models";
import { defaultPreferences } from "./preferences";
import * as prompts from "./prompts";
export * from "./privacy";
export * from "./prompts";
export * from "./terms";

const configs = {
  version: "1.0.3",
  ...links,
  ...prompts,
  ollamaTagsEndpoint: "/api/tags",
};

export {
  allPlugins, configs,
  constants,
  defaultPreferences,
  docs,
  examplePrompts,
  examples,
  models, ollamaModelsSupportsTools, providers
};

