<script setup>
import { storeToRefs } from 'pinia'
import { useSequenceStore } from '@/stores/sequence.js'
import { ref } from 'vue'
// import { ref,useAttrs } from 'vue';
defineProps({
  item: Object,
  url: String,
  id: Number
})

const store = useSequenceStore()

const { sampleData, sampleTypeList } = storeToRefs(store)
</script>

<template>
  <select @input="$emit('update:id', $event.target.value)">
    <template v-for="sampleType in sampleTypeList" :key="sampleType">
      <optgroup :label="sampleType">
        <template v-for="sample in sampleData">
          <option v-if="sample.type === sampleType" :key="sample.file" :value="sample.note">
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
  font-family: monospace;
}
</style>
