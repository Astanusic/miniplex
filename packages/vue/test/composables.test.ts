import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/vue"
import { World } from "miniplex"
import { defineComponent, h, nextTick } from "vue"
import { createVueAPI } from "../src"

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

describe("useEntities", () => {
  it("returns the entities of the specified archetype and re-renders the component when the archetype updates", async () => {
    const world = new World<{ name?: string }>()
    const { useEntities } = createVueAPI(world)

    const alice = world.add({ name: "Alice" })
    world.add({ name: "Bob" })

    const Component = defineComponent({
      setup() {
        const entities = useEntities(world.with("name"))
        return { entities }
      },
      render() {
        return h('ul', this.entities.map(e => h('li', e.name)))
      }
    })

    render(Component)
    await nextTick()

    let items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent("Bob")
    expect(items[1]).toHaveTextContent("Alice")

    world.add({ name: "Charlie" })
    await nextTick()

    items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent("Bob")
    expect(items[1]).toHaveTextContent("Alice")
    expect(items[2]).toHaveTextContent("Charlie")

    world.remove(alice)
    await nextTick()

    items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent("Bob")
    expect(items[1]).toHaveTextContent("Charlie")
  })
})

describe("useCurrentEntity", () => {
  it("returns the context's entity when invoked within an entity context", async () => {
    const world = new World<{ name?: string }>()
    const { Entity: MiniplexEntity, useCurrentEntity } = createVueAPI(world)

    const entity = world.add({ name: "John" })

    const ChildComponent = defineComponent({
      setup() {
        const currentEntity = useCurrentEntity()
        return { currentEntity }
      },
      render() {
        return h('p', this.currentEntity?.name)
      }
    })

    render(MiniplexEntity, {
      props: { entity },
      slots: {
        default: () => h(ChildComponent)
      }
    })
    
    await nextTick()
    expect(screen.getByText("John")).toBeInTheDocument()
  })

  it("throws an error when invoked outside of an entity context", () => {
    const world = new World<{ name?: string }>()
    const { useCurrentEntity } = createVueAPI(world)

    const ChildComponent = defineComponent({
      setup() {
        const currentEntity = useCurrentEntity()
        return { currentEntity }
      },
      render() {
        return h('p', this.currentEntity === undefined ? 'undefined' : 'defined')
      }
    })

    // Vue 3 runtime captures errors in setup and outputs them to console or error handler.
    // To catch it in Jest, we can expect the render to throw.
    expect(() => render(ChildComponent)).toThrow("useCurrentEntity must be called from a child of <MiniplexEntity>.")
  })
})

describe("useOnEntityAdded", () => {
  it("calls the callback when an entity is added to the world", async () => {
    const world = new World<{ name?: string }>()
    const { useOnEntityAdded } = createVueAPI(world)
    const callback = jest.fn()

    const Component = defineComponent({
      setup() {
        useOnEntityAdded(world, callback)
        return () => null
      }
    })

    render(Component)
    
    world.add({ name: "Alice" })
    await nextTick()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith({ name: "Alice" })
  })
})

describe("useOnEntityRemoved", () => {
  it("calls the callback when an entity is removed from the world", async () => {
    const world = new World<{ name?: string }>()
    const { useOnEntityRemoved } = createVueAPI(world)
    const callback = jest.fn()

    const Component = defineComponent({
      setup() {
        useOnEntityRemoved(world, callback)
        return () => null
      }
    })

    render(Component)
    const entity = world.add({ name: "Alice" })
    await nextTick()

    world.remove(entity)
    await nextTick()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(entity)
  })
})
