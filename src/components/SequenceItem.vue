<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import SampleSelect from '@/components/SampleSelect.vue'
import SequenceItemArc from '@/components/SequenceItemArc.vue'
import Modal from '@/components/Modal.vue'
import { useSequenceStore } from '@/stores/sequence.js'
import { storeToRefs } from 'pinia'
import SequenceSteps from '@/components/SequenceSteps.vue'
import BaseButton from './BaseButton.vue'
import * as Tone from 'tone'
import { createSequenceArrayIndex } from '@/helpers/toneHelpers'
import { toReactive } from '@vueuse/core'
const apiBaseURL = import.meta.env.VITE_API_BASE
const props = defineProps({
  item: Object,
  id: Number,
  empty: Boolean,
  reverb: Number,
  volume: Number,
  sampleFiles: Object
})

const store = useSequenceStore()
// store values to vuejs ref
const { currentStepIndex, sequenceData, sampleTypeList, isPlaying, columns, sampleObjectMidi } =
  storeToRefs(store)

const {
  toggleStep,
  updateSequenceURL,
  removeSequence,
  updateSequenceSample,
  setCurrentStepIndex,
  randomSequenceSteps
} = store

const itemData = toReactive(sequenceData.value[props.id])

defineEmits(['update:volume', 'update:reverb'])

let sequence = null
const showModal = ref(false)
const isThisLoaded = ref(false)
console.log('props.item')
console.log(props.item)
const sampleObject = computed(() => {
  let newObj = {}
  if (props.item) {
    let obj = props.item
    if (obj && obj.sampleId && obj.url) {
      newObj[obj.sampleId] = obj.url
    }
  }
  return newObj
})
console.log('sampleObject.value')
console.log(sampleObject.value)
let sampler = null

sampler = new Tone.Sampler({
  urls: store.sampleObjectMidi,
  onload: () => {
    isThisLoaded.value = true
  }
})
  .toDestination()
  .sync()

// sampler = new Tone.Sampler().toDestination().sync()

// sampler.buffer = props.sampleFiles.get(props.item.sampleId)
console.log('sampler.get(props.item.sampleId.toString())')
console.log(sampler.get(props.item.sampleDataId))
sampler.get(props.item.sampleId.toString())
console.log('sampler.buffer')
console.log(sampler.buffer)

const currentStep = ref(currentStepIndex.value)
const vol = new Tone.Volume(props.volume).toDestination()
let rev = new Tone.Reverb({
  ready: () => {
    // if (props.reverb !== 0) {
    //   // console.log(sampler.connect(rev))
    //   sampler.connect(rev)
    // }

    if (props.reverb < 0) {
      console.log('<0')
    }
  }
}).toDestination()

const tick = (time, col) => {
  console.log(rev.get())

  if (props.reverb >= 0.001) {
    // sampler.connect(rev)
    // rev.set({ decay: props.reverb })
  } else {
    // sampler.disconnect(rev)
  }

  // vol.set(itemData.volume)

  sampler.connect(vol)

  if (props.item.steps[col] === true) {
    sampler.triggerAttackRelease(props.item.sampleId, '16n', time)
  }
}

sequence = new Tone.Sequence(tick, createSequenceArrayIndex(columns.value), '16n')
sequence.humanize = true
sequence.start(0)

const resetSequence = () => {
  // fires only when state.someObject is replaced
}

const resetSamples = () => {
  // fires only when state.someObject is replaced
  if (sampler) {
    sampler.dispose()
    return (sampler = new Tone.Sampler({
      urls: store.sampleObjectMidi,
      onload: () => {
        console.log('2st sampleObjectMidi done')
      }
    }).toDestination())
  }
}

watch(sampleObject, () => {
  return resetSamples()
})

watch(
  () => props.volume,
  (nVol) => {
    console.log(`vol is: ${nVol}`)
    if (vol) {
      vol.set({ volume: nVol })
    }
  }
)

watch(
  () => props.reverb,
  (newRev) => {
    console.log(newRev)

    if (newRev > 0.001 && newRev !== 0 && newRev !== null) {
      rev.set({ decay: newRev })
      sampler.connect(rev)
    } else {
      sampler.disconnect(rev)
    }
  }
)

onMounted(() => {
  resetSamples()
  if (sequence) {
    sequence.dispose()
    sequence = new Tone.Sequence(tick, createSequenceArrayIndex(columns.value), '16n').start(0)
  }
  // if (isPlaying.value) return Tone.Transport.start(Tone.now())
})

onUnmounted(() => {
  if (sequence) {
    sequence.dispose()
  }
  if (sampler) {
    sampler.dispose()
  }
})
</script>
<template>
  <div class="sequence-item">
    <div class="sequence-title-wrapper">
      <p>
        Sample: <span class="active-sample-title">{{ item.sampleName }}</span>
      </p>
    </div>
    <div class="sequence-item-wrapper">
      <BaseButton
        icon="tune"
        class="btn-icon"
        id="show-modal"
        @click="showModal = true"
      ></BaseButton>
      <slot></slot>
      <slot name="steps">
        <SequenceSteps
          v-if="!empty"
          :id="id"
          :item="item"
          :color="item.color"
          :highlighted="currentStepIndex"
        />
      </slot>
      <BaseButton
        icon="shuffle"
        class="btn-icon"
        id="show-modal"
        @click="randomSequenceSteps(id)"
      />
      <div v-if="!empty">
        <BaseButton @click="removeSequence(id)" icon="delete" />
      </div>

      <Teleport to="main" v-if="!empty">
        <!-- use the modal component, pass in the prop -->
        <Modal :show="showModal" @close="showModal = false">
          <template #header>
            <h3>Edit sound</h3>
          </template>
          <template #body>
            <div class="input-group">
              <label for="reverb">Sample:</label>
              <Suspense>
                <SampleSelect
                  class="sample-select"
                  :value="item.sampleDataId"
                  @update:url="updateSequenceURL(id, $event)"
                  @change:sampleDataId="updateSequenceSample"
                  :item="item"
                  :id="id"
                />
              </Suspense>
            </div>
            <div class="input-group">
              <label for="reverb">Reverb:</label>
              <input
                id="reverb"
                type="range"
                min="0"
                max="10"
                @change="$emit('update:reverb', $event.target.value)"
                :value="reverb"
                step="0.5"
              />
            </div>
            <div class="input-group">
              <label for="volume">Volume:</label>
              <input
                id="volume"
                type="range"
                min="-70"
                max="0"
                @input="$emit('update:volume', $event.target.value)"
                :value="volume"
                step="1"
              />
            </div>
          </template>
        </Modal>
      </Teleport>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sequence-item {
  // grid-template-columns:auto 1fr auto;
  display: flex;
  // overflow-x: visible;
  // overflow-y: scroll;
  flex-direction: column;
  // justify-content: space-between;
  gap: 0.5em;
}

.sequence-item-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.sample-select {
  max-width: 12em;

  background: -var(--color-background-mute);
}

.input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.active-sample-title {
  color: #2ecd71;
  text-transform: uppercase;
}
</style>
 