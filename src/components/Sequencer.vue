<!-- eslint-disable vue/multi-word-component-names -->
<script async setup>
import {
  ref,
  reactive,
  watch,
  onMounted,
  onUnmounted,
  TransitionGroup,
  Transition,
  computed,
  watchEffect
} from 'vue'

import { useSequenceStore } from '@/stores/sequence.js'

import { storeToRefs } from 'pinia'
import * as Tone from 'tone'
// Pack with sample names

const store = useSequenceStore()
import InputBpm from '@/components/InputBpm.vue'
import { createSequenceArrayIndex } from '@/helpers/toneHelpers.js'

import BaseButton from '@/components/BaseButton.vue'
import SequenceItem from '@/components/SequenceItem.vue'
import SequenceItemControl from '@/components/SequenceItemControl.vue'
import { useElementBounding, useShare, whenever } from '@vueuse/core'

// store values to vuejs ref
const {
  availableNotes,
  isPlaying,
  columns,
  sequenceData,
  isStarted,
  bpm,
  reverb,
  chorus,
  isSamplesLoaded
} = storeToRefs(store)

const { setStarted, addSequence, togglePlayPause, setCurrentStepIndex, setSamplesLoaded } = store

let sequence = null
// let sampler = null
let samples = new Tone.Sampler({
  urls: store.sampleObjectMidi,
  onload: () => {
    console.log('onload Mini players')
    setSamplesLoaded(true)
  }
}).toDestination()

const tick = (time, col) => {
  Tone.Draw.schedule(() => {
    if (isPlaying.value) {
      setCurrentStepIndex(col)
    }
  }, time)
}

sequence = new Tone.Sequence(tick, createSequenceArrayIndex(columns.value), '16n').start(0)

Tone.Transport.bpm.value = bpm.value

watch(bpm, (newBpm) => {
  Tone.Transport.bpm.value = newBpm
  // configSequence()
})

const togglePlay = (e) => {
  // let now = Tone.now()
  // Tone.Transport.stop()
  console.log('isStarted.value')
  console.log(isStarted.value)
  // if (!isStarted.value) {
  //   setToneStart(e)
  // }

  togglePlayPause()

  if (isPlaying.value) {
    Tone.getDestination()
    // get current time
    //set playtime to current time
    // playtime is state
    // playTime.value = now
    //start sequence +0.1 in the fututre

    Tone.Transport.start(Tone.now())
    // sequence.start()
  } else {
    Tone.Transport.pause(Tone.now())
    // sequence.stop()
  }
}

const onKeyDown = (event) => {
  if (event.code === 'Space') {
    togglePlay()
    event.preventDefault()
  }
}

// watch(
//   () => store.sequenceData,
//   () => {
//     // fires only when state.someObject is replaced
//     if (sequence) {
//       sequence.dispose()
//       sequence = new Tone.Sequence(tick, createSequenceArrayIndex(columns.value), '16n').start(
//         Tone.now()
//       )
//     }
//     if (samples) {
//       samples.dispose()
//       samples = new Tone.Sampler({
//         urls: store.sampleObjectMidi,
//         onload: () => {
//           console.log('2st sampler done')
//         }
//       }).toDestination()

//       // sampler.sync()
//     }
//     if (sampler) {
//       sampler.dispose()
//       sampler = new Tone.Sampler({
//   urls: store.sampleObject,
//   onload: () => {
//     console.log('1st sampler done')
//   }
// }).toDestination()
//     }
//   }
// )

watch(
  () => store.sequenceData,
  () => {
    // resetPlayers()
  }
)

// fires only when state.someObject is replaced
const resetSequence = () => {
  // fires only when state.someObject is replaced
  if (sequence === 'fenuiwf') {
    sequence.dispose()
    sequence = new Tone.Sequence(tick, createSequenceArrayIndex(columns.value), '16n').start(
      Tone.now()
    )
  }
}

const resetSamples = () => {
  // fires only when state.someObject is replaced
  if (samples) {
    samples.dispose()
    samples = new Tone.Sampler({
      urls: store.sampleObjectMidi,
      onload: () => {
        console.log('resetted sampler done')
      }
    }).toDestination()

    // sampler.sync()
  }
}

watchEffect(() => {
  bpm.value
  resetSequence()
})
let useSampleFiles = null
onMounted(() => {
  useSampleFiles = new Tone.ToneAudioBuffers({
    urls: store.sampleObjectMidi,
    onload: () => {
      store.bufferLoaded.setLoaded()
      console.log(`bufferLoaded is: ${store.bufferLoaded.value}`)
    }
  })

  // Tone.start()
  // configSequence()
  Tone.Transport.on('start', () => {
    if (!isStarted.value) setStarted(true)
  })
  Tone.Transport.on('stop', () => {
    setCurrentStepIndex(-1)
    // setStarted(false)
  })
  window.addEventListener('keydown', onKeyDown)

  console.log(useSampleFiles.get('101'))
})

whenever(store.bufferLoaded, () => {
  console.log(useSampleFiles.get('101'))
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

const { share, isSupported } = useShare()

function startShare() {
  share({
    title: 'HitLoop',
    text: 'Hello my friend! HitLoop is Awesome, check this out',
    url: location.href
  })
}

const controlRef = ref(null)

const controlHeight = computed(() => {
  const height = useElementBounding(controlRef).height.value
  return height + 'px'
})
</script>

<template>
  <div id="sequencer" v-if="sequenceData && store.sampleData">
    <Suspense>
      <TransitionGroup name="fade" v-if="store.bufferLoaded.value">
        <SequenceItem
          v-for="item in store.sequenceData"
          :key="item.id"
          :item="item"
          :id="item.id"
          v-model:reverb.number.lazy="item.reverb"
          v-model:volume.number="item.volume"
          :sampleFiles="useSampleFiles"
        />
        <div class="add-sequence" :key="sequenceData.lastIndexOf + 1">
          <BaseButton
            icon="add"
            v-show="sequenceData.length !== availableNotes.length"
            @click="addSequence()"
          >
          </BaseButton>
        </div>
      </TransitionGroup>
    </Suspense>
    <Transition> </Transition>
  </div>
  <div ref="controlRef" class="controlls">
    <div class="start">
      <BaseButton v-if="isSupported" @click="startShare" icon="ios_share" />
    </div>

    <div class="end">
      <InputBpm />
      <Suspense>
        <BaseButton
          :disabled="!isSamplesLoaded"
          @click="togglePlay($event)"
          :icon="isPlaying ? 'pause' : 'play_arrow'"
        />
        <!-- <BaseButton v-else @click="togglePlay" icon="pause" /> -->
      </Suspense>
    </div>
  </div>
</template>

<style scoped lang="scss">
.add-sequence {
  margin-inline: auto;
  transition: all 0.5s;
  position: sticky;
  bottom: 0;
}

.controlls {
  display: flex;
  position: fixed;
  bottom: 0.75em;
  left: 0;
  right: 0;
  // position: sticky;
  // bottom: 0.5em;
  margin-left: 1em;
  margin-right: 1em;
  z-index: 2;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  align-content: center;
  gap: 1em;
  // max-width: 100%;
  width: 100%;

  background-color: #343434;
  border-radius: 8px;
  // padding: 1em 2em;
  padding: var(--padding-l);
  width: calc(100% - 2em);

  div.end {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    align-content: center;
    gap: 1em;
  }
}
.sequencer {
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;

  width: 100%;
  height: 7rem;
  padding: 2rem;
}

.step-container {
  display: flex;
  flex-direction: column;
  margin-top: 0.1em;
  margin-bottom: 0.1em;
}
// .step:first-child {
//   height: 10rem;
// }
.step {
  width: 3em;
  height: 3em;
  border: 1px solid var(--color-black);
  // transition: all 1ms ease-in-out;
  position: absolute;

  &.highlighted {
    border: 4px solid var(--color-orange);
  }
}

svg {
  width: 10rem;
  line {
    cursor: pointer;
  }
}
.arc-item {
  stroke: #cbcbcb;
}
.active {
  stroke-opacity: 50%;
  stroke: #2ecd71;
}

.highlighted {
  stroke-opacity: 50%;

  // stroke: green;
}

.highlighted.active {
  stroke-width: 22;
}

#sequencer {
  position: relative;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  // grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* see notes below */
  grid-gap: 2rem;
  padding: var(--padding-l);
  margin-bottom: calc(v-bind(controlHeight) + 1em);
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  // div {
  //   display: flex;
  //   flex-wrap: wrap;
  //   flex-direction: row;

  //   div {
  //     display: flex;
  //   }
  // }
}
.row {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  overflow: hidden;
}

select {
  width: 100%;
}
.active {
  background-color: var(--color-black-mute);
}

/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleX(0.01) translate(30px, 0);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
  opacity: 0;
  position: absolute;
}
</style>
