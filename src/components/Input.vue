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

const props = defineProps({
  item: Object,
  id: Number,
  name: String,
  type: String,
  min: Number,
  max: Number,
  step: Number
})

const store = useSequenceStore()

const { bpm } = storeToRefs(store)

const { moreBPM, lessBPM } = store
</script>

<template>
  <div>
    {{ name }}
  </div>
  <div class="input-group">
    <button @click="lessBPM"><BaseIcon name="remove" /></button>
    <input id="bpm" type="number" :min="min" :max="max" :step="step" v-model.number="bpm" />
    <button @click="moreBPM"><BaseIcon name="add" /></button>
  </div>
</template>

<style lang="scss" scoped>
div.input-group {
  display: flex;
  flex-direction: row;
  gap: 1em;
  align-items: center;
}

button {
  font-size: 1.5em;
  border: 0;
  padding: 0;
  margin: 0;
}
</style>
