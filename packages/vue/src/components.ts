import {
  defineComponent,
  inject,
  provide,
  onMounted,
  onBeforeUnmount,
  watch,
  type PropType,
  type VNode,
  type Ref,
} from "vue";
import type { World, Query } from "miniplex";
import { EntitySymbol } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createComponents<E extends Record<string, any>>(
  world: World<E>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useEntities: (query: Query<any>) => Ref<E[]>,
) {
  const Entity = defineComponent({
    name: "MiniplexEntity",
    props: {
      entity: {
        type: Object as PropType<E>,
        required: false,
      },
    },
    setup(props, { slots }) {
      const entity = (props.entity as E) || ({} as E);
      let addedByUs = false;

      provide(EntitySymbol, entity);

      onMounted(() => {
        if (!world.has(entity)) {
          world.add(entity);
          addedByUs = true;
        }
      });

      onBeforeUnmount(() => {
        if (addedByUs) {
          world.remove(entity);
        }
      });

      return () => slots.default?.({ entity });
    },
  });

  const Component = defineComponent({
    name: "MiniplexComponent",
    props: {
      name: {
        type: String as PropType<keyof E>,
        required: true,
      },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: null as any,
        required: false,
      },
    },
    setup(props, { slots }) {
      const entity = inject(EntitySymbol) as E | undefined;

      if (!entity) {
        console.warn("MiniplexComponent must be a child of MiniplexEntity");
        return () => slots.default?.();
      }

      onMounted(() => {
        const value = props.data !== undefined ? props.data : (true as any);
        world.addComponent(entity, props.name as keyof E, value);
      });

      onBeforeUnmount(() => {
        world.removeComponent(entity, props.name as keyof E);
      });

      watch(
        () => props.data,
        (newData) => {
          const value = newData !== undefined ? newData : (true as any);
          entity[props.name as keyof E] = value as E[keyof E];
        },
      );

      return () => slots.default?.();
    },
  });

  const Entities = defineComponent({
    name: "MiniplexEntities",
    props: {
      in: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: [Object, Array] as PropType<Query<any> | E[]>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const isQuery = props.in && "onEntityAdded" in props.in;
      const entitiesRef = isQuery
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (useEntities as any)(props.in as Query<any>)
        : undefined;

      return () => {
        const list = entitiesRef ? entitiesRef.value : (props.in as E[]);
        return list.map(
          (entity: E) => slots.default?.({ entity }) as unknown as VNode,
        );
      };
    },
  });

  return {
    Entity,
    Component,
    Entities,
  };
}
