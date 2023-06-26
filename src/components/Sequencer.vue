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

import BaseIcon from '@/components/BaseIcon.vue'
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
  chorusType
} = storeToRefs(store)

const { toggleStep, setStarted, addSequence, togglePlayPause, setCurrentStepIndex } = store

// Base url for the api

// const bpm = ref(120)
const playTime = ref(null)
// let sequence

// const sampler = new Tone.Sampler().toDestination()
let sequence = null
// let sampler = null
let samples = new Tone.Players({
  urls: store.playersObject
})
const isBlobReady = ref(false)

// let sampler

let sampler = new Tone.Sampler({
      urls: store.sampleObject,
  onload: () => {
        console.log('1st sampler done')
        // for (const row of sequenceData.value) {
        //   console.log(row.steps[col])
        //   if (row.steps[col]) {
        //     // notesToPlay.value.push(row.sample)
            
        //     playNote({
        //       detail: {
        //         item: row,
        //         time: time
        //       }
        //     })
            
        //   }
        // }
        // sampler.triggerAttackRelease(notesToPlay.value, '16n', Tone.now()).sync()
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
  
  sequence.humanize = true

  console.log(sequence.get())
}

const tick = (time, col) => {

    // console.log(col)
    Tone.Draw.schedule(() => {
      if (isPlaying.value) {
        setCurrentStepIndex(col)
      }
    }, time)


    sampler = new Tone.Sampler({
      urls: store.sampleObject,
      onload: () => {
        for (const row of sequenceData.value) {
          console.log(row.steps[col])
          if (row.steps[col]) {
            // notesToPlay.value.push(row.sample)
            
            playNote({
              detail: {
                item: row,
                time: time
              }
            })
            
          }
        }
        // sampler.triggerAttackRelease(notesToPlay.value, '16n', Tone.now()).sync()
      }
    }).toDestination()
    


    let notesToPlay = ref([])
    notesToPlay.value = []

    // let rev = new Tone.Reverb(reverb.value).toDestination()
    // sampler.chain(rev, Tone.Destination)
    // console.log(reverb.value)
    // console.log(chorus.value)

    // Tone.loaded().then(() => {
    //   sampler.sync()
    //   sampler.toDestination()
    // })
    // sampler.triggerAttackRelease(notesToPlay.value, '16n', time).sync()
  }

sequence = new Tone.Sequence(tick, createSequenceArrayIndex(columns.value), '16n').start()



function playNote({ detail }) {
  
  
  if (reverb.value.decay !== 0) {
    let rev = new Tone.Reverb(reverb.value).toDestination()
    sampler.chain(rev, Tone.Destination)
  }
  console.log(`playnote: ${detail.item.sample}`)
  sampler.triggerAttackRelease(detail.item.sample, '16n', detail.time)
  
}

Tone.Transport.bpm.value = bpm.value

watch(bpm, (newBpm) => {
  Tone.Transport.bpm.value = newBpm
  configSequence()
})

const setToneStart = async () => {
  if (!isStarted.value) {
    await setStarted()
    Tone.getDestination().volume.rampTo(-10, 0.001)
    
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
    
    Tone.Transport.start()
    sequence.start()
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
  () => store.sampleObject,
  () => {
    // fires only when state.someObject is replaced
    if (sequence) {
      sequence.dispose()
      sequence = new Tone.Sequence(tick, createSequenceArrayIndex(columns.value), '16n').start(Tone.TransportTime())
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
  configSequence()
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
      <BaseButton @click="togglePlay($event)" :icon="isPlaying ? 'pause' : 'play_arrow'" />
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
  bottom: .5em;
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
