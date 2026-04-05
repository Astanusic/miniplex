<script setup lang="ts">
import { TresCanvas } from "@tresjs/core"
import { OrbitControls } from "@tresjs/cientos"
import Boids from "./Boids.vue"

import { useSpatialHashingSystem } from "./systems/SpatialHashingSystem"
import { useIdentifyNeighborSystem } from "./systems/IdentifyNeighborSystem"
import { useCoherenceSystem } from "./systems/CoherenceSystem"
import { useSeparationSystem } from "./systems/SeparationSystem"
import { useAlignmentSystem } from "./systems/AlignmentSystem"
import { useAvoidEdgesSystem } from "./systems/AvoidEdgesSystem"
import { useApplyForcesSystem } from "./systems/ApplyForcesSystem"
import { useVelocitySystem } from "./systems/VelocitySystem"

// Init all systems
useSpatialHashingSystem()
useIdentifyNeighborSystem(3)
useCoherenceSystem(3)
useSeparationSystem(8)
useAlignmentSystem(1)
useAvoidEdgesSystem(5, 20)
useApplyForcesSystem()
useVelocitySystem(6)
</script>

<template>
  <TresCanvas window-size>
    <TresPerspectiveCamera :position="[0, 0, 50]" />
    <OrbitControls />

    <TresAmbientLight :intensity="0.2" />
    <TresDirectionalLight :position="[1, 2, 3]" :intensity="0.8" />

    <Boids />
  </TresCanvas>
</template>
