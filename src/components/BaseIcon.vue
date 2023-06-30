<script setup>
// defineProps = ({
//   name: String,
//   fill: Number,
//   weight: Number,
//   opsz: Number
// });

defineProps({
  name: String,
  FILL: {
    type: Number,
    default: 1
  },
  wght: {
    type: [Number, String],
    default: 400
  },
  GRAD: {
    type: Number,
    default: 200
  },
  opsz: {
    type: Number,
    default: 48
  }
})
</script>

<template>
  <span class="icon material-symbols-rounded">
    {{ name }}
  </span>
</template>

<style lang="scss" scoped>
.icon {
  // font-size: inherit;
  color: var(--color-text);
}
span.icon:hover {
  // transform: scale(2);
}
.material-symbols-rounded {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 200, 'opsz' 48;
}

// .material-symbols-rounded {
//   // font-size: 1em;
//   font-size: inherit;

//   font-variation-settings: "FILL" v-bind(FILL), "wght" v-bind(wght), "GRAD" v-bind(GRAD),
//     "opsz" v-bind(opsz);
// }
</style>
