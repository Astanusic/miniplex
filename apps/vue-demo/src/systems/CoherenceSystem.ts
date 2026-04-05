import { useRenderLoop } from "@tresjs/core"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "neighbors", "forces")

export function useCoherenceSystem(factor = 1) {
  const { onLoop } = useRenderLoop()

  onLoop(() => {
    for (const {
      forces: { coherence },
      neighbors,
      transform
    } of entities) {
      coherence.set(0, 0, 0)

      if (neighbors.length === 0) continue

      for (const neighbor of neighbors) {
        coherence.add(neighbor.transform.position)
      }

      coherence.divideScalar(neighbors.length)
      coherence.sub(transform.position).multiplyScalar(factor)
    }
  })
}
