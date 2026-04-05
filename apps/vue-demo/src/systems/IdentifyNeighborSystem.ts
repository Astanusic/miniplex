import { useRenderLoop } from "@tresjs/core"
import { ECS } from "../state"

const entities = ECS.world.with("transform", "neighbors", "spatialHashMap")

export function useIdentifyNeighborSystem(maxDistance = 3) {
  const { onLoop } = useRenderLoop()

  onLoop(() => {
    for (const entity of entities) {
      const { transform, neighbors, spatialHashMap } = entity

      /* Query the spatial hash map for nearby entities */
      spatialHashMap.getNearbyEntities(
        transform.position.x,
        transform.position.y,
        transform.position.z,
        maxDistance,
        neighbors,
        100
      )

      /* Remove entity itself from neighbors */
      const index = neighbors.indexOf(entity as any)
      if (index !== -1) {
        neighbors.splice(index, 1)
      }
    }
  })
}
