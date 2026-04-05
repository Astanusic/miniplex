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
import { type World, Bucket } from "miniplex";
import { EntitySymbol } from "./types";

export function createComponents<E extends {}>(
  world: World<E>,
  useEntities: <D extends E>(bucket: Bucket<D>) => Ref<D[]>,
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
        type: String as unknown as PropType<keyof E>,
        required: true,
      },
      data: {
        type: null as unknown as PropType<unknown>,
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
        const value = props.data !== undefined ? props.data : (true as E[keyof E]);
        world.addComponent(entity, props.name as keyof E, value as E[keyof E]);
      });

      onBeforeUnmount(() => {
        world.removeComponent(entity, props.name as keyof E);
      });

      watch(
        () => props.data,
        (newData) => {
          const value = newData !== undefined ? newData : (true as E[keyof E]);
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
        type: [Object, Array] as PropType<Bucket<E> | E[]>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const entitiesRef = props.in instanceof Bucket
        ? useEntities(props.in as Bucket<E>)
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
