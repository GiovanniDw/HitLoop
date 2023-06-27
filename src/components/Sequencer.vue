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

// store values to vuejs ref
const {
  availableNotes,
  activeNotes,
  currentStepIndex,
  sampleData,
  isPlaying,
  columns,
  sequenceData,
  isStarted,
  bpm,
  reverb,
  chorus,
  chorusTypeList,
  chorusType,
  isSamplesLoaded
} = storeToRefs(store)

const { setStarted, addSequence, togglePlayPause, setCurrentStepIndex, setSamplesLoaded } = store

// Base url for the api

// const bpm = ref(120)
const playTime = ref(null)
// let sequence
// Tone.setContext(new Tone.Context({ latencyHint : "playback" }))
// const sampler = new Tone.Sampler().toDestination()
let sequence = null
// let sampler = null
let samples = new Tone.Sampler({
  urls: store.playersMidiObject,
  onload: () => {
    console.log('onload players')
    setSamplesLoaded(true)
  }
})
// let sampler

let sampler = new Tone.Sampler({
  urls: store.sampleObject,
  onload: () => {
    console.log('1st sampler done')
  }
}).toDestination()

const configSequence = () => {
  // let chor = new Tone.Chorus(chorus.value).toDestination()
  // sampler = new Tone.Sampler({
  //     urls: store.sampleObject,
  //     onload: () => {
  //     console.log('loaded')
  //       // sampler.triggerAttackRelease(notesToPlay.value, '16n', Tone.now()).sync()
  //     }
  //   }).toDestination()
  // tick is callback function which is runned every
  // const tick = (time, col) => {
  //   sampler = new Tone.Sampler({
  //     urls: store.sampleObject,
  //     onload: () => {
  //       for (const row of sequenceData.value) {
  //         console.log(row.steps[col])
  //         if (row.steps[col]) {
  //           // notesToPlay.value.push(row.sample)

  //           playNote({
  //             detail: {
  //               item: row,
  //               time: time
  //             }
  //           })

  //         }
  //       }
  //       // sampler.triggerAttackRelease(notesToPlay.value, '16n', Tone.now()).sync()
  //     }
  //   }).toDestination()

  //   // console.log(col)
  //   Tone.Draw.schedule(() => {
  //     if (isPlaying.value) {
  //       setCurrentStepIndex(col)
  //     }
  //   }, time)

  //   let notesToPlay = ref([])
  //   notesToPlay.value = []

  //   // let rev = new Tone.Reverb(reverb.value).toDestination()
  //   // sampler.chain(rev, Tone.Destination)
  //   // console.log(reverb.value)
  //   // console.log(chorus.value)

  //   // Tone.loaded().then(() => {
  //   //   sampler.sync()
  //   //   sampler.toDestination()
  //   // })
  //   // sampler.triggerAttackRelease(notesToPlay.value, '16n', time).sync()
  // }

  // sequence.humanize = true

  console.log(sequence.get())
}

const tick = (time, col) => {
  Tone.Draw.schedule(() => {
    if (isPlaying.value) {
      setCurrentStepIndex(col)
    }
  }, time)
  // samples.sync()

  for (const row of sequenceData.value) {
    if (row.steps[col]) {
      playNote({
        detail: {
          item: row,
          time: time
        }
      })
    }
  }
}

sequence = new Tone.Sequence(tick, createSequenceArrayIndex(columns.value), '16n').start('+0.001')
sequence.humanize = true

function playNote({ detail }) {
  // samples.toDestination()

  if (reverb.value.decay !== 0) {
    const rev = new Tone.Reverb().toDestination()
    rev.set(reverb.value)
    samples.chain(rev, Tone.Destination)

    // samples.player(detail.item.sampleId)
  }
  samples.triggerAttackRelease(detail.item.sampleId, '16n', detail.time).toDestination()
  //  samples.player(detail.item.sampleId, 0, detail.time, 0.5)
  // samples.player(detail.item.sampleId).start(detail.time, '+0.001', '16n')
}

Tone.Transport.bpm.value = bpm.value

watch(bpm, (newBpm) => {
  Tone.Transport.bpm.value = newBpm
  // configSequence()
})

const setToneStart = async () => {
  if (!isStarted.value) {
    await setStarted()
    Tone.getDestination().volume.rampTo(-10, 0.01)

    // togglePlay()
    return
  }
}

const togglePlay = (e) => {
  let now = Tone.now()
  // Tone.Transport.stop()

  if (!isStarted.value) {
    setToneStart(e)
  }

  togglePlayPause()

  if (isPlaying.value) {
    // get current time
    //set playtime to current time
    // playtime is state
    playTime.value = now
    //start sequence +0.1 in the fututre

    Tone.Transport.start('+0.001')
    // sequence.start()
  } else {
    Tone.Transport.pause()
    // sequence.stop()
  }
}

const onKeyDown = (event) => {
  if (event.code === 'Space') {
    togglePlay()
    event.preventDefault()
  }
}

watch(
  () => store.sequenceData,
  () => {
    // fires only when state.someObject is replaced
    if (sequence) {
      sequence.dispose()
      sequence = new Tone.Sequence(tick, createSequenceArrayIndex(columns.value), '16n').start(
        Tone.now()
      )
    }
    if (samples) {
      samples.dispose()
      samples = new Tone.Sampler({
        urls: store.playersMidiObject,
        onload: () => {
          console.log('2st sampler done')
        }
      }).toDestination()

      // sampler.sync()
    }
  }
)

watchEffect(() => {
  bpm.value
  chorus.value
  reverb.value
  // rev = new Tone.Reverb(reactiveReverb).toDestination()
  console.log(reverb.value)
  // sequence.chain(rev)
  configSequence()
})

onMounted(() => {
  // Tone.start()
  // configSequence()
  Tone.Transport.on('start', () => setStarted(true))
  Tone.Transport.on('stop', () => {
    setCurrentStepIndex(-1)
    setStarted(false)
  })
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div id="sequencer" v-if="sequenceData">
    <Suspense>
      <TransitionGroup name="fade">
        <SequenceItem v-for="item in sequenceData" :key="item.id" :item="item" :id="item.id" />
      </TransitionGroup>
    </Suspense>
    <SequenceItem class="add-sequence" empty>
      <BaseButton
        icon="add"
        v-show="sequenceData.length !== availableNotes.length"
        @click="addSequence()"
      >
        <!-- <BaseIcon name="add" /> -->
      </BaseButton>
    </SequenceItem>
  </div>
  <div class="controlls">
    <InputBpm />
    <div>
      <!-- <button @click="store.chorusTypeList.prev()">prev</button>
        <p>{{ chorusType }}</p>
        <button @click="store.chorusTypeList.next()">next</button> -->
    </div>

    <label for="reverb">reverb</label>
    <input id="reverb" type="number" min="0" max="10" v-model.number="reverb.decay" step="0.5" />
    <Suspense>
      <BaseButton
        :disabled="!isSamplesLoaded"
        @click="togglePlay($event)"
        :icon="isPlaying ? 'pause' : 'play_arrow'"
      />
      <!-- <BaseButton v-else @click="togglePlay" icon="pause" /> -->
    </Suspense>
  </div>
</template>

<style scoped lang="scss">
.add-sequence {
  margin-inline: auto;
}

.controlls {
  display: flex;
  position: sticky;
  bottom: 0.5em;
  z-index: 2;
  justify-content: end;
  align-items: center;
  align-content: center;
  gap: 1em;
  width: 100%;
  height: 7rem;
  background-color: var(--color-background);
  border-radius: 8px;
  padding: var(--padding-l);
}
.sequencer {
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
  display: flex;
  flex-direction: column;
  // grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* see notes below */
  grid-gap: 1em;
  padding: var(--padding-l);

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
