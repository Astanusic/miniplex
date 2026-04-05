import { useRenderLoop } from "@tresjs/core"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "neighbors", "forces")

export function useSeparationSystem(factor = 1) {
  const { onLoop } = useRenderLoop()

  onLoop(() => {
    for (const {
      forces: { separation },
      neighbors,
      transform
    } of entities) {
      separation.set(0, 0, 0)

      if (neighbors.length === 0) continue

      for (const neighbor of neighbors) {
        const distance = transform.position.distanceTo(
          neighbor.transform.position
        )
        const direction = transform.position
          .clone()
          .sub(neighbor.transform.position)
          .normalize()
        separation.add(direction.divideScalar(distance))
      }

      separation.divideScalar(neighbors.length)
      separation.multiplyScalar(factor)
    }
  })
}
