import { ref } from 'vue'
import * as Tone from 'tone'

export const createSampleObjectList = async (sampleData, url) => {
  const data = sampleData.value
  let id = 0
  let currentNote = 21 // MIDI note value for A0 (lowest note)
  const sampleObjectList = data.files
    .map((str) => {
      const regex = /^(hi-hat|.+)[-_\s](\d+)_(\d+)_(.+)\.wav$/
      const matches = str.match(regex)
      if (matches && matches.length === 5) {
        const [, type, version1, version2, name] = matches
        const version = `${version1}.${version2}`
        const nameOnly = name.replace(/_/g, '-')
        let sampleType = type
        if (type === 'hi-hat') {
          sampleType = 'Hi-Hat'
        }
        try {
          const note = getValidMidiNoteFromId(currentNote) // Get a valid MIDI note value based on currentNote
          if (note === null) {
            // If there are no available MIDI notes, skip this sample
            return null;
          }
          const encodedStr = encodeURIComponent(str)
          // const nameCaseChange = useChangeCase(nameOnly, 'capitalCase')
          const sampleObject = {
            id: id,
            name: name.replace(/_/g, '-'),
            type: sampleType.charAt(0).toUpperCase() + sampleType.slice(1),
            version,
            file: str,
            url: url + encodedStr,
            note: note
          }
          id++
          currentNote = currentNote % 12 === 7 ? currentNote + 1 : currentNote + 2;
          if (currentNote > 127) {
            // Reset currentNote if it exceeds the maximum MIDI note value
            currentNote = 21;
          }
          return sampleObject
        } catch (error) {
          console.error(error)
          // Handle any specific error if needed
          return null
        }
      } else {
        // Handle invalid file name format if needed
        return null
      }
    })
    .filter((obj) => obj !== null)
  return sampleObjectList
}

const loadSampleBuffers = async (sampleObjectList) => {
  const sampler = new Tone.Sampler().toDestination()

  const promises = sampleObjectList.map((obj) => {
    return new Promise((resolve, reject) => {
      const buffer = new Tone.Buffer(
        obj.url,
        () => {
          sampler.add(obj.note, buffer)
          resolve()
        },
        reject
      )
    })
  })

  try {
    await Promise.all(promises)
    console.log('Samples loaded successfully')
  } catch (error) {
    console.error('Error loading samples:', error)
  }
}



const getValidMidiNoteFromId = (id) => {
  const octave = Math.floor((id - 1) / 7); // Determine the octave based on the ID
  const noteIndex = (id - 1) % 7; // Determine the index within the octave based on the ID
  const noteMap = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const note = noteMap[noteIndex];
  const midiNote = octave * 12 + noteToMidiOffset(note);

  // Check if the MIDI note is within the valid range (0-127)
  if (midiNote >= 0 && midiNote <= 127) {
    return midiNote;
  } else {
    return null; // Return null if the MIDI note is out of range
  }
}

// Function to get the MIDI offset for a specific note (assuming A = 0, B = 1, C = 2, etc.)
const noteToMidiOffset = (note) => {
  const noteMap = { A: 9, B: 11, C: 0, D: 2, E: 4, F: 5, G: 7 };
  return noteMap[note.toUpperCase()];
}