import * as Tone from 'tone'
import { ref } from 'vue'
const useMakeSamplers = (sequenceData) => {
  // each synth can only play one note at a time.
  // for simplicity, we'll create one synth for each note available
  // this allows for easy polyphony (multiple notes playing at the same time)

  // Documentation for Tone.Synth can be found here:
  // https://tonejs.github.io/docs/r13/Synth
  //
  // Demo different oscillator settings here:
  // https://tonejs.github.io/examples/oscillator

  const samplers = ref([])

  for (const item in sequenceData) {
    let sampler = new Tone.Sample({
      oscillator: { type: 'sine' }
    }).toDestination()
    sampler.value.push(samplers)
  }

  // I'm using an oscillator with a square wave and 8 partials
  // because I like how it sounds.
  //
  // You could simply write new Tone.Synth().toDestination() instead.
  // This would work just as well, but sound slightly different.
  //
  // Demo different oscillator settings here:
  // https://tonejs.github.io/examples/oscillator

  return samplers.value
}
