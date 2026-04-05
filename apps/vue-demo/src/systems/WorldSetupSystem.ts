import { Vector3, Object3D } from "three"
import { ECS } from "../state"
import { SpatialHashMap } from "./SpatialHashMap"

export const boidsSpatialHashMap = new SpatialHashMap(5)

export function spawnBoid(
  position: Vector3,
  velocity = new Vector3()
) {
  ECS.world.add({
    boid: true,
    velocity,
    neighbors: [],
    spatialHashMap: boidsSpatialHashMap,
    forces: {
      coherence: new Vector3(),
      separation: new Vector3(),
      alignment: new Vector3(),
      avoidEdges: new Vector3()
    },
    transform: (() => {
      const obj = new Object3D()
      obj.position.copy(position)
      return obj
    })()
  })
}

export default function useWorldSetupSystem() {
  console.log("Populating Miniplex world")

  for (let i = 0; i < 1000; i++) {
    const position = new Vector3(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    )

    const velocity = new Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize()

    spawnBoid(position, velocity)
  }
}
