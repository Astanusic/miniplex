import type { World } from "miniplex";
import { createComposables } from "./composables";
import { createComponents } from "./components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createVueAPI<E extends Record<string, any>>(world: World<E>) {
  const composables = createComposables(world);
  const components = createComponents(world, composables.useEntities);

  return {
    world,
    ...composables,
    ...components,
  };
}

export * from "./types";
