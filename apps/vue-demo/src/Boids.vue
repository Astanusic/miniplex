<script setup lang="ts">
import { shallowRef } from 'vue'
import { useRenderLoop } from '@tresjs/core'
import type { InstancedMesh } from 'three'
import { ECS } from './state'
import useWorldSetupSystem from './systems/WorldSetupSystem'

// Spawn 1000 boids
useWorldSetupSystem()

const boids = ECS.world.with("boid", "transform")
const count = 1000

const imeshRef = shallowRef<InstancedMesh>()
const { onLoop } = useRenderLoop()

onLoop(() => {
  if (!imeshRef.value) return
  
  let i = 0
  for (const { transform } of boids) {
    if (i >= count) break
    transform.updateMatrix()
    imeshRef.value.setMatrixAt(i, transform.matrix)
    i++
  }
  imeshRef.value.instanceMatrix.needsUpdate = true
})
</script>

<template>
  <TresInstancedMesh ref="imeshRef" :args="[undefined, undefined, count]">
    <TresIcosahedronGeometry :args="[0.5]" />
    <TresMeshStandardMaterial color="hotpink" />
  </TresInstancedMesh>
</template>
