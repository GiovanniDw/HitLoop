<template>
  <button @click="testSound">Test Sound</button>

  <div class="grid-sequencer">
    <div class="controls">
      <button @click="togglePlay">{{ isPlaying ? 'Pause' : 'Play' }}</button>
    </div>
    <div class="grid">
      <svg width="820" height="300">
        <!-- Create all squares -->
        <template v-for="(row, y) in grid" :key="'row' + y">
          <template v-for="(cell, x) in row" :key="'cell' + x">
            <rect
              :id="'square' + y + '-' + x"
              :x="x * 50"
              :y="y * 50"
              width="40"
              height="40"
              :class="{ active: cell }"
              @click="toggleCell(x, y)"
            />
          </template>
        </template>
      </svg>
    </div>
    <div class="note-selection">
      <label v-for="(note, y) in selectedNotes" :key="y">
        Row {{ y + 1 }}:
        <select v-model="selectedNotes[y]">
          <option v-for="n in notes" :key="n">{{ n }}</option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as Tone from 'tone'

const notes = ['C4', 'D4', 'E4', 'F4', 'G4']
let selectedNotes = ref(notes.slice())
let grid = reactive(
  Array(5)
    .fill()
    .map(() => Array(16).fill(false))
)
let isPlaying = ref(false)
let synth = new Tone.PolySynth(Tone.Synth).toDestination()
let sequences = []

function createSequences() {
  sequences = grid[0].map((col, x) => {
    return new Tone.Sequence(
      (time, step) => {
        grid.forEach((row, y) => {
          if (row[step]) {
            synth.triggerAttackRelease(selectedNotes[y], '8n', time)
          }
        })
      },
      Array.from({ length: 16 }, (_, i) => i),
      '8n'
    )
  })
}

async function togglePlay() {
  if (Tone.context.state !== 'running') {
    await Tone.start()
  }
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    Tone.Transport.start()
    sequences.forEach((seq) => seq.start())
  } else {
    Tone.Transport.stop()
    sequences.forEach((seq) => seq.stop())
  }
}

function toggleCell(x, y) {
  grid[y][x] = !grid[y][x]
}

onMounted(() => {
  createSequences()
})

onUnmounted(() => {
  sequences.forEach((seq) => {
    seq.dispose()
  })
  sequences = []
  synth.dispose()
  synth = null
})

function testSound() {
  synth.triggerAttackRelease('C4', '8n')
}
</script>

<style scoped>
svg rect {
  fill: #ccc;
  stroke: #333;
  stroke-width: 2;
}

svg rect.active {
  fill: #f00;
}

.note-selection {
  margin-top: 20px;
}

.note-selection label {
  margin-right: 20px;
}
</style>
