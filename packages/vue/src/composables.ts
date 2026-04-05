import { inject, onScopeDispose, shallowRef, triggerRef, type Ref } from "vue";
import type { Bucket, World } from "miniplex";
import { EntitySymbol } from "./types";

export function createComposables<E extends {}>(_world: World<E>) {
  const useEntities = <D extends E>(bucket: Bucket<D>): Ref<D[]> => {
    const entities = shallowRef(bucket.entities);

    const update = () => {
      triggerRef(entities);
    };

    const unsubAdded = bucket.onEntityAdded.subscribe(update);
    const unsubRemoved = bucket.onEntityRemoved.subscribe(update);

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
