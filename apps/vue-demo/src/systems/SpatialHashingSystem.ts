import { useRenderLoop } from "@tresjs/core"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "spatialHashMap")

export function useSpatialHashingSystem() {
  const { onLoop } = useRenderLoop()

  onLoop(() => {
    for (const entity of entities) {
      entity.spatialHashMap.setEntity(
        entity,
        entity.transform.position.x,
        entity.transform.position.y,
        entity.transform.position.z
      )
    }
  })
}
