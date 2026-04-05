import { useRenderLoop } from "@tresjs/core"
import { ECS } from "../state"

const entities = ECS.world.with("forces", "velocity")

export function useApplyForcesSystem() {
  const { onLoop } = useRenderLoop()

  onLoop(({ delta }) => {
    for (const { forces, velocity } of entities) {
      velocity.addScaledVector(forces.coherence, delta)
      velocity.addScaledVector(forces.separation, delta)
      velocity.addScaledVector(forces.alignment, delta)
      velocity.addScaledVector(forces.avoidEdges, delta)
    }
  })
}
