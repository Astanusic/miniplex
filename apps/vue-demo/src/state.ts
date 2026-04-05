import { type With, World } from "miniplex"
import { createVueAPI } from "miniplex-vue"
import { type Object3D, Vector3 } from "three"
import { SpatialHashMap } from "./systems/SpatialHashMap"

export type Entity = {
  boid?: true

  velocity?: Vector3
  neighbors?: With<Entity, "transform" | "velocity">[]

  spatialHashMap?: SpatialHashMap

  forces: {
    coherence: Vector3
    separation: Vector3
    alignment: Vector3
    avoidEdges: Vector3
  }

  transform?: Object3D
}

export const ECS = createVueAPI(new World<Entity>())
