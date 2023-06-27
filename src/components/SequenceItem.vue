<script setup>
import SampleSelect from '@/components/SampleSelect.vue'
import SequenceItemArc from '@/components/SequenceItemArc.vue'

import { useSequenceStore } from '@/stores/sequence.js'
import { storeToRefs } from 'pinia'
import SequenceSteps from '@/components/SequenceSteps.vue'
import BaseButton from './BaseButton.vue'
const apiBaseURL = import.meta.env.VITE_API_BASE
const props = defineProps({
  item: Object,
  id: Number,
  empty: Boolean
})

const store = useSequenceStore()
// store values to vuejs ref
const { samplePack, currentStepIndex, sequenceData, sampleTypeList } = storeToRefs(store)

const { toggleStep, updateSequenceURL, removeSequence, updateSequenceByValue } = store
</script>
<template>
  <div class="sequence-item">
    <slot name="select" v-if="!empty">
      <Suspense>
        <SampleSelect
          class="sample-select"
          @update:url="updateSequenceURL(id, $event)"
          @update:id="updateSequenceByValue(id, $event)"
          :item="item"
          :id="id"
        />
      </Suspense>
    </slot>
    <slot></slot>
    <slot name="steps">
      <SequenceSteps v-if="!empty" :id="id" :item="item" :color="item.color" />
    </slot>
    <div v-if="!empty">
      <BaseButton @click="removeSequence(id)" icon="delete" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sequence-item {
  // grid-template-columns:auto 1fr auto;
  display: flex;
  // overflow-x: visible;
  // overflow-y: scroll;
  align-items: center;
  // justify-content: space-between;
  gap: 1em;
}

.sample-select {
  max-width: 12em;

  background: -var(--color-background-mute);
}
</style>
