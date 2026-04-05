import { useRenderLoop } from "@tresjs/core"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "neighbors", "forces")

export function useAlignmentSystem(factor = 1) {
  const { onLoop } = useRenderLoop()

  onLoop(() => {
    for (const {
      forces: { alignment },
      neighbors
    } of entities) {
      alignment.set(0, 0, 0)

      if (neighbors.length === 0) continue

      for (const neighbor of neighbors) {
        alignment.add(neighbor.velocity)
      }

      alignment.divideScalar(neighbors.length)
      alignment.multiplyScalar(factor)
    }
  })
}
