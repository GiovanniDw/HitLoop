import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import * as Tone from 'tone'
import {
  createSampleObject,
  createSequenceArraySteps,
  createSequenceArrayIndex
} from '@/helpers/toneHelpers.js'

import { getSampleData, getSampleFile, getSampleUrl } from '@/composables/getSampleData.js'
import { useCycleList } from '@vueuse/core'

const apiBaseURL = import.meta.env.VITE_API_BASE

export const useSequenceStore = defineStore('sequence', () => {
  const isStarted = ref(false)
  async function setStarted() {
    await Tone.start()
    isStarted.value = true
  }
  const currentStepIndex = ref(-1)
  function setCurrentStepIndex(i) {
    return (currentStepIndex.value = i)
  }
  const isPlaying = ref(false)
  const bpm = ref(130)
  function moreBPM() {
    if (bpm.value < 300) bpm.value = bpm.value + 10
  }
  function lessBPM() {
    bpm.value = bpm.value - 10
  }
  const reverb = ref({
    decay: 0.001,
    preDelay: 0.01
  })

  const chorusTypeList = useCycleList(['sine', 'square', 'sawtooth', 'triangle'], {
    initialValue: 'sine',
    fallbackIndex: 0
  })

  const chorusType = computed(() => {
    return chorusTypeList.state.value
  })

  const chorus = ref({
    frequency: 1.5,
    delayTime: 3.5,
    depth: 0.7,
    type: chorusType,
    spread: 180
  })

  const columns = ref(16)
  const availableNotes = ref(['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'A4'])

  const activeNotes = ref(['A3'])
  const availableColors = ref(['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'G3', 'A4'])
  const samplePack = ref('b')
  const sampleTypeList = ref(['Crash', 'Kick', 'Sfx', 'Snare'])
  // const sampleTypeList = ref(['Crash', 'Kick', 'Sfx', 'Snare', 'Hi-Hat'])
  // sampleData is array of objects witl sample data. file name, url, type(Crash Hi-hat-Etc)
  const sampleData = ref([])
  // hold the sequence data.sampleNote, sampleURL, steps[false, true], color

  const getInitialSequence = () => {
    const sample = availableNotes.value[0]
    return [
      {
        id: 0,
        sample: 'A3',
        steps: createSequenceArraySteps(columns.value),
        url: 'https://api-hitloop.responsible-it.nl/test_samples?sample_pack=b&file=crash_1_0_IJ-pont_varen.wav',
        color: 'red'
      }
    ]
  }

  const sequenceData = ref(getInitialSequence())
  // activeNotes.value.map((sample) => ({
  //   sample,
  //   steps: createSequenceArraySteps(columns.value),
  //   url: getSampleUrl(apiBaseURL, samplePack.value, sampleData[1].file)
  // }))
  // sets the sample data to sampleData.value

  const isSampleDataReady = ref(false)

  async function setSampleData() {
    try {
      const data = await getSampleData(apiBaseURL, samplePack.value, 'list')
      console.log(data.value)

      await data.value.forEach(async (sample, i) => {
        let blob = await getSampleFile(sample.url)
        sample.blob = blob.value
      })
      console.log(data.value)

      return (sampleData.value = data.value)
      // return sampleData.value
    } catch (error) {
      console.log(error)
    } finally {
      isSampleDataReady.value = true
    }
  }
  // creates sequence data array. based on active notes
  setSampleData()

  // async function setSequenceData() {
  //   try {
  //     await setSampleData()

  //     return (sequenceData.value = activeNotes.value.map((sample) => ({
  //       sample,
  //       steps: createSequenceArraySteps(columns.value),
  //       url: getSampleUrl(apiBaseURL, samplePack.value, sampleData.value[0].file),
  //       color: 'red'
  //     })))
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // // setSampleData()
  // setSequenceData()
  // adds a sequence to sequenceData array
  const addSequence = () => {
    const uniqueNote = availableNotes.value[sequenceData.value.length % availableNotes.value.length]
    if (sequenceData.value.length === availableNotes.value.length) {
      // All available notes are used, disable the function or handle the case as needed
      return
    }
    if (!sequenceData.value) return

    let currentMaxId = sequenceData.value.reduce((maxId, item) => {
      return item.id > maxId ? item.id : maxId
    }, 0)
    const newId = currentMaxId + 1
    let all = sequenceData.value.length
    console.log(all)
    let thisSample = availableNotes.value[all]
    let thisColor = availableColors.value[all]
    // activeNotes.value.push(thisSample)
    sequenceData.value.push({
      id: newId,
      sample: uniqueNote,
      steps: createSequenceArraySteps(columns.value),
      url: getSampleUrl(apiBaseURL, samplePack.value, sampleData.value[0].file),
      color: thisColor
    })
  }
  const removeSequence = (id, e) => {
    const index = sequenceData.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      sequenceData.value.splice(index, 1)
    }
  }

  //creates a sample object for toneJS to use in sequencer

  // sampleObject.value {
  //   A3: 'https://api-hitloop.responsible-it.nl/test_samples?sample_pack=b&file=crash_1_0_IJ-pont_varen.wav',
  //   B3: 'https://api-hitloop.responsible-it.nl/test_samples?sample_pack=b&file=crash_1_0_IJ-pont_varen.wav'
  // }
  const sampleObject = computed(() => {
    const newObj = {}
    if (sequenceData.value && sequenceData.value && Array.isArray(sequenceData.value)) {
      sequenceData.value.forEach((obj) => {
        if (obj && obj.sample && obj.url) {
          newObj[obj.sample] = obj.url
        }
      })
    }
    return newObj
  })
  const playersObject = computed(() => {
    const newObj = {}
    if (sequenceData.value && sequenceData.value && Array.isArray(sequenceData.value)) {
      sequenceData.value.forEach((obj) => {
        if (obj && obj.sample && obj.url) {
          newObj[obj.id] = obj.url
        }
      })
    }
    return newObj
  })
  // const sequenceData = computed(() => {
  //   return sequenceData.value
  // })
  function toggleStep(row, step) {
    return (row.steps[step] = !row.steps[step])
  }
  const updateSequenceURL = async (index, newUrl) => {
    console.log(newUrl)
    return (sequenceData.value[index].url = newUrl)
  }

  const togglePlayPause = (val) => {
    isPlaying.value = !isPlaying.value
  }

  const togglePlay = (val) => {
    togglePlayPause()
    if (isPlaying.value) {
      Tone.Transport.start()
    } else {
      Tone.Transport.stop()
    }
  }

  return {
    bpm,
    sequenceData,
    isPlaying,
    samplePack,
    sampleData,
    columns,
    availableNotes,
    activeNotes,
    currentStepIndex,
    addSequence,
    toggleStep,
    updateSequenceURL,
    togglePlayPause,
    sampleTypeList,
    setCurrentStepIndex,
    sampleObject,
    togglePlay,
    isStarted,
    setStarted,
    moreBPM,
    lessBPM,
    reverb,
    chorus,
    chorusTypeList,
    chorusType,
    isSampleDataReady,
    removeSequence,
    playersObject
  }
})
