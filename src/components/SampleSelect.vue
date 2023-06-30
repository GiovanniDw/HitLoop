<script setup>
import { storeToRefs } from 'pinia'
import Modal from './Modal.vue'
import { useSequenceStore } from '@/stores/sequence.js'
import { ref } from 'vue'
// import { ref,useAttrs } from 'vue';
const props = defineProps({
  item: Object,
  url: String,
  id: Number,
  sampleDataId: Number
})

const store = useSequenceStore()

const { sampleData, sampleTypeList, sequenceData } = storeToRefs(store)
</script>

<template>
  <select
    :v-model="item.sampleDataId"
    @change="$emit('change:sampleDataId', id, $event.target.value)"
  >
    <template v-for="sampleType in sampleTypeList" :key="sampleType">
      <optgroup :label="sampleType">
        <template v-for="sample in sampleData">
          <option v-if="sample.type === sampleType" :key="sample.id" :value="sample.id">
            {{ sample.version }} {{ sample.name }}
          </option>
        </template>
      </optgroup>
    </template>
  </select>
</template>

<style lang="scss" scoped>
select {
  max-width: 100%;

  padding: 0.3em;
  margin-right: 1em;
  // background: -var(--color-background-soft);
  // color: var(--color-text);
}
option {
  font-family: 'Press Start 2P', Inter;
}
</style>
