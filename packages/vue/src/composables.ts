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

  const useOnEntityAdded = <D extends E>(
    bucket: Bucket<D>,
    callback: (entity: D) => void
  ) => {
    const unsub = bucket.onEntityAdded.subscribe(callback);
    onScopeDispose(() => unsub());
  };

  const useOnEntityRemoved = <D extends E>(
    bucket: Bucket<D>,
    callback: (entity: D) => void
  ) => {
    const unsub = bucket.onEntityRemoved.subscribe(callback);
    onScopeDispose(() => unsub());
  };

  /**
   * Returns the current entity from the nearest <MiniplexEntity> component.
   */
  const useCurrentEntity = (): E => {
    const entity = inject(EntitySymbol) as E | undefined;

    if (!entity) {
      throw new Error(
        "useCurrentEntity must be called from a child of <MiniplexEntity>."
      );
    }

    return entity;
  };

  return {
    useEntities,
    useOnEntityAdded,
    useOnEntityRemoved,
    useCurrentEntity,
  };
}
