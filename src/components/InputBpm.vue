<script setup>
import {
  ref,
  reactive,
  watch,
  onMounted,
  onUnmounted,
  TransitionGroup,
  Transition,
  computed
} from 'vue'
import { storeToRefs } from 'pinia'
import * as Tone from 'tone'
// Pack with sample names
import { useSequenceStore } from '@/stores/sequence.js'
import BaseIcon from '@/components/BaseIcon.vue'
import BaseButton from '@/components/BaseButton.vue'
const store = useSequenceStore()

const { bpm } = storeToRefs(store)

const { moreBPM, lessBPM } = store
</script>

<template>
  <div class="input-group-v">
    <label for="bpm">BPM</label>
    <div>
      <BaseButton icon="remove" @click="lessBPM" />
      <input id="bpm" type="number" min="20" max="300" step="5" v-model.number="bpm" />
      <BaseButton icon="add" @click="moreBPM" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
div div {
  font-size: 1em;
  flex-direction: row;
}
.input-group-v {
  display: flex;
  flex-direction: column;
  font-size: 1em;
  gap: 0.1em;
  position: relative;
}
label {
  font-size: 0.9em;
  display: block;
  flex-shrink: 2;
  position: absolute;
  top: -1.5em;
}
div {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  align-items: center;
}

button {
  font-size: 3em;
  border: 0;
  padding: 0;
  margin: 0;
}
</style>
