import { inject, onScopeDispose, shallowRef, triggerRef, type Ref } from "vue";
import type { Bucket, World } from "miniplex";
import { EntitySymbol } from "./types";

export function createComposables<E extends {}>(_world: World<E>) {
  /**
   * Subscribes to changes in the specified bucket, and re-renders the component
   * whenever entities are added to or removed from it.
   *
   * @param bucket The bucket to watch for changes
   * @returns A Vue Ref containing the entities
   */
  const useEntities = <D extends E>(bucket: Bucket<D>): Ref<D[]> => {
    const entities = shallowRef(bucket.entities);

    const update = () => {
      /* Re-render any time the bucket changes */
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

  /**
   * Returns the current entity from the nearest <MiniplexEntity> component.
   */
  const useCurrentEntity = (): E | undefined => {
    return inject(EntitySymbol) as E | undefined;
  };

  return {
    useEntities,
    useCurrentEntity,
  };
}
