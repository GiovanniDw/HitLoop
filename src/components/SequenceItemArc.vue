<script setup>
import { useSequenceStore } from '@/stores/sequence'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const props = defineProps({
  id: Number,
  sampleTypeList: Array,
  sampleData: Array,
  item: Object,
  url: String,
  columns: Number,
  row: Object,
  highlighted: Number,
  col: Number
})

const store = useSequenceStore()
// store values to vuejs ref
const { currentStepIndex } = storeToRefs(store)

const { toggleStep } = store

const gapSize = Math.PI / 10

function describeArcOld(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'
  const d = ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ')
  return d
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'
  const d = ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ')
  return d
}

function polarToCartesian(centerX, centerY, radius, angleInRadians) {
  const x = centerX + radius * Math.cos(angleInRadians)
  const y = centerY + radius * Math.sin(angleInRadians)
  return { x, y }
}

function getStartAngle(index) {
  return (2 * Math.PI * index) / props.columns + gapSize / 2
}

function getEndAngle(index) {
  return (2 * Math.PI * (index + 1)) / props.columns - gapSize / 2
}
</script>

<template>
  <svg viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="80" fill="none" stroke="none" />
    <g transform="translate(100,100)">
      <path
        v-for="(step, stepIndex) in props.columns"
        class="arc-item"
        :key="stepIndex"
        :d="describeArc(0, 0, 80, getStartAngle(stepIndex), getEndAngle(stepIndex))"
        :class="{ active: row.steps[stepIndex], highlighted: stepIndex === currentStepIndex }"
        @click="toggleStep(row, stepIndex)"
        stroke-width="15"
        stroke="blue"
        fill="none"
        stroke-linecap="round"
        :name="stepIndex"
      />
    </g>
  </svg>
</template>

<style lang="scss" scoped>
.arc-item {
  stroke: #fff ;
  transition: all 0.5s;
}
.active {
  stroke-opacity: 50%;
  stroke: var(--color-green);


}

.highlighted {
  // stroke-opacity: 50%;
  stroke: var(--color-text)

  // stroke: green;
}

.highlighted.active {
  stroke-width: 22;
  transform: scale(1.75);
  stroke: var(--color-text)
}




</style>
