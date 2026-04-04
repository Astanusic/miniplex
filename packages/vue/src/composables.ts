import { inject, onScopeDispose, shallowRef, triggerRef, type Ref } from "vue";
import type { Query, World } from "miniplex";
import { EntitySymbol } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createComposables<E extends Record<string, any>>(
  _world: World<E>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useEntities = (query: Query<any>): Ref<E[]> => {
    const entities = shallowRef(query.entities);

    const update = () => {
      triggerRef(entities);
    };

    const unsubAdded = query.onEntityAdded.subscribe(update);
    const unsubRemoved = query.onEntityRemoved.subscribe(update);

    onScopeDispose(() => {
      unsubAdded();
      unsubRemoved();
    });

    return entities;
  };

  const useCurrentEntity = (): E | undefined => {
    return inject(EntitySymbol) as E | undefined;
  };

  return {
    useEntities,
    useCurrentEntity,
  };
}
