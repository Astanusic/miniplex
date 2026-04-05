import { useRenderLoop } from "@tresjs/core"
import { ECS } from "../state"

const entities = ECS.world.with("velocity", "transform")

export function useVelocitySystem(maxVelocity = 5) {
  const { onLoop } = useRenderLoop()

  onLoop(({ delta }) => {
    for (const { velocity, transform } of entities) {
      /* Apply maximum velocity limit */
      velocity.clampLength(0, maxVelocity)

      /* Apply velocity to transform */
      transform.position.addScaledVector(velocity, delta)

      /* Point transform in direction of velocity */
      const target = transform.position.clone().add(velocity)
      transform.lookAt(target)
    }
  })
}
