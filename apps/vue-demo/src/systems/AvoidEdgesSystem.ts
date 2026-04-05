import { useRenderLoop } from "@tresjs/core"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "forces")

export function useAvoidEdgesSystem(factor = 1, maxDistance = 2) {
  const { onLoop } = useRenderLoop()

  onLoop(() => {
    for (const {
      forces: { avoidEdges },
      transform
    } of entities) {
      const distance = transform.position.length()

      if (distance > maxDistance) {
        avoidEdges
          .copy(transform.position)
          .normalize()
          .negate()
          .multiplyScalar(factor)
      }
    }
  })
}
