import type { World } from "miniplex";
import { createComposables } from "./composables";
import { createComponents } from "./components";

export function createVueAPI<E extends {}>(world: World<E>) {
  const composables = createComposables(world);
  const components = createComponents(world, composables.useEntities);

  return {
    world,
    ...composables,
    ...components,
  };
}

export * from "./types";
