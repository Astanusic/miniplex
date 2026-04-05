import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/vue"
import { World } from "miniplex"
import { defineComponent, h, nextTick, ref } from "vue"
import { createVueAPI } from "../src"

type Entity = {
  name?: string
  age?: number
  height?: number
  div?: HTMLDivElement | null
}

beforeEach(() => {
  jest.spyOn(console, "error")
  // @ts-ignore
  console.error.mockImplementation(() => null)
  jest.spyOn(console, "warn")
  // @ts-ignore
  console.warn.mockImplementation(() => null)
})

afterEach(() => {
  // @ts-ignore
  console.error.mockRestore()
  // @ts-ignore
  console.warn.mockRestore()
})

describe("<Entity>", () => {
  it("creates an entity", async () => {
    const world = new World<Entity>()
    const { Entity: MiniplexEntity } = createVueAPI(world)

    expect(world.entities.length).toBe(0)
    const { unmount } = render(MiniplexEntity)
    
    await nextTick()
    expect(world.entities.length).toBe(1)
    
    unmount()
  })

  it("removes the entity on unmount", async () => {
    const world = new World<Entity>()
    const { Entity: MiniplexEntity } = createVueAPI(world)

    const { unmount } = render(MiniplexEntity)
    await nextTick()
    expect(world.entities.length).toBe(1)
    unmount()
    expect(world.entities.length).toBe(0)
  })

  it("accepts a scoped slot as its child", async () => {
    const world = new World<Entity>()
    const { Entity: MiniplexEntity } = createVueAPI(world)

    const entity = world.add({ name: "John" })

    render(MiniplexEntity, {
      props: { entity },
      slots: {
        default: (props: any) => h("div", props.entity.name)
      }
    })
    
    await nextTick()

    expect(world.entities[0].name).toBe("John")
    expect(screen.getByText("John")).toBeInTheDocument()
  })

  describe("with a given entity that is not yet part of the bucket", () => {
    it("adds the entity to the bucket", async () => {
      const world = new World<Entity>()
      const { Entity: MiniplexEntity } = createVueAPI(world)
      const entity = { name: "John" }

      expect(world.entities.length).toBe(0)
      render(MiniplexEntity, { props: { entity } })
      await nextTick()
      expect(world.entities.length).toBe(1)
      expect(world.entities[0]).toStrictEqual(entity)
    })

    it("removes the entity on unmount", async () => {
      const world = new World<Entity>()
      const { Entity: MiniplexEntity } = createVueAPI(world)
      const entity = { name: "John" }

      const { unmount } = render(MiniplexEntity, { props: { entity } })
      await nextTick()
      expect(world.entities.length).toBe(1)
      unmount()
      expect(world.entities.length).toBe(0)
    })
  })
})

describe("<Component>", () => {
  it("assigns the specified component", async () => {
    const world = new World<Entity>()
    const { Entity: MiniplexEntity, Component: MiniplexComponent } = createVueAPI(world)

    render(MiniplexEntity, {
      slots: {
        default: () => h(MiniplexComponent, { name: "name", data: "John" })
      }
    })
    
    await nextTick()
    expect(world.entities[0]).toMatchObject({})
    expect(world.entities[0].name).toBe("John")
  })

  it("updates the specified component on re-rendering", async () => {
    const world = new World<Entity>()
    const { Entity: MiniplexEntity, Component: MiniplexComponent } = createVueAPI(world)

    const nameRef = ref("John")

    const Parent = defineComponent({
      render() {
        return h(MiniplexEntity, null, {
          default: () => h(MiniplexComponent, { name: "name", data: nameRef.value })
        })
      }
    })

    const { rerender } = render(Parent)
    await nextTick()
    expect(world.entities[0].name).toBe("John")

    // Update parent
    nameRef.value = "Jane"
    await rerender({ nameRef: "Jane" })
    await nextTick()
    expect(world.entities[0].name).toBe("Jane")
  })

  it("removes the component when the component is unmounted", async () => {
    const world = new World<Entity>()
    const entity = world.add({ name: "John" })
    const { Entity: MiniplexEntity, Component: MiniplexComponent } = createVueAPI(world)

    const showRef = ref(true)

    const Parent = defineComponent({
      render() {
        return h(MiniplexEntity, { entity }, {
          default: () => showRef.value ? h(MiniplexComponent, { name: "age", data: 50 }) : null
        })
      }
    })

    const { rerender } = render(Parent)
    await nextTick()
    expect(world.entities[0].age).toBe(50)

    showRef.value = false
    await rerender({ showRef: false })
    await nextTick()
    expect(world.entities[0]).toEqual({ name: "John" })
  })

  it("captures the ref of the child when it has one", async () => {
    const world = new World<Entity>()
    const entity = world.add({})

    const { Entity: MiniplexEntity, Component: MiniplexComponent } = createVueAPI(world)

    const Parent = defineComponent({
      render() {
        return h(MiniplexEntity, { entity }, {
          default: () => h(MiniplexComponent, { name: "div" }, {
            default: () => h("div", { id: "test-div" })
          })
        })
      }
    })

    const { unmount } = render(Parent)
    await nextTick()

    // check if ref was captured
    expect(entity.div).not.toBeUndefined()
    
    // Check if the actual DOM node was assigned
    expect(entity.div instanceof HTMLDivElement).toBe(true)
    expect(entity.div?.id).toBe("test-div")

    unmount()
    await nextTick()

    expect(entity.div).toBeUndefined()
  })

  describe("when the entity already has the component", () => {
    it("updates the component", async () => {
      const world = new World<Entity>()
      const { Entity: MiniplexEntity, Component: MiniplexComponent } = createVueAPI(world)
      const entity = world.add({ name: "John" })

      render(MiniplexEntity, {
        props: { entity },
        slots: {
          default: () => h(MiniplexComponent, { name: "name", data: "Jane" })
        }
      })
      await nextTick()
      
      expect(world.entities[0].name).toBe("Jane")
    })
  })
})

describe("<Entities>", () => {
  describe("with an array of entities", () => {
    it("renders the entities", async () => {
      const world = new World<Entity>()
      const { Entities: MiniplexEntities } = createVueAPI(world)

      const entities = [
        world.add({ name: "John" }),
        world.add({ name: "Jane" })
      ]

      render(MiniplexEntities, {
        props: { in: entities },
        slots: {
          default: (props: any) => h('p', props.entity.name)
        }
      })
      
      await nextTick()

      expect(screen.getByText("John")).toBeInTheDocument()
      expect(screen.getByText("Jane")).toBeInTheDocument()
    })
  })

  describe("with a bucket", () => {
    it("renders the entities within the given bucket", async () => {
      const world = new World<Entity>()
      const { Entities: MiniplexEntities } = createVueAPI(world)

      world.add({ name: "Alice" })
      world.add({ name: "Bob" })

      render(MiniplexEntities, {
        props: { in: world },
        slots: {
          default: (props: any) => h('p', props.entity.name)
        }
      })
      
      await nextTick()

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })

    it("re-renders the entities when the bucket contents change", async () => {
      const world = new World<Entity>()
      const { Entities: MiniplexEntities } = createVueAPI(world)

      const alice = world.add({ name: "Alice" })
      world.add({ name: "Bob" })

      render(MiniplexEntities, {
        props: { in: world },
        slots: {
          default: (props: any) => h('p', props.entity.name)
        }
      })
      
      await nextTick()

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()

      world.add({ name: "Charlie" })
      await nextTick()

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
      expect(screen.getByText("Charlie")).toBeInTheDocument()

      world.remove(alice)
      await nextTick()

      expect(screen.queryByText("Alice")).toBeNull()
      expect(screen.getByText("Bob")).toBeInTheDocument()
      expect(screen.getByText("Charlie")).toBeInTheDocument()
    })
  })
})

describe("world", () => {
  it("is a reference to the world originally passed into createVueAPI", () => {
    const world = new World<{ name: string }>()
    const api = createVueAPI(world)
    expect(api.world).toBe(world)
  })
})
