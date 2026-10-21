<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { Pause, Play } from 'lucide-vue-next'
import { heroMedia } from '../data/hero'
import { imageUrl } from '../../shared/content.mjs'

const paused = ref(false)
const failed = ref(false)
const reducedMotion = ref(
  window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)
let motionPreference
const showAnimation = computed(
  () =>
    heroMedia.animatedSrc &&
    !paused.value &&
    !reducedMotion.value &&
    !failed.value,
)
function updatePreference(event) {
  reducedMotion.value = event.matches
}
onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionPreference.matches
  motionPreference.addEventListener('change', updatePreference)
})
onBeforeUnmount(() =>
  motionPreference?.removeEventListener('change', updatePreference),
)
</script>

<template>
  <div
    class="hero-image"
    :style="{
      backgroundImage: `url(${JSON.stringify(imageUrl(heroMedia.poster, 2400))})`,
    }"
    aria-hidden="true"
  >
    <img
      v-if="showAnimation"
      class="hero-animated-image"
      :src="imageUrl(heroMedia.animatedSrc, 2400)"
      alt=""
      fetchpriority="high"
      decoding="async"
      @error="failed = true"
    />
  </div>
  <button
    v-if="heroMedia.animatedSrc && !failed && !reducedMotion"
    class="hero-animation-toggle"
    :aria-label="
      paused ? 'Fon animatsiyasini yoqish' : 'Fon animatsiyasini to‘xtatish'
    "
    :aria-pressed="paused"
    @click="paused = !paused"
  >
    <Play
      v-if="paused"
      :size="14"
    />
    <Pause
      v-else
      :size="14"
    />
    {{ paused ? 'Animatsiyani yoqish' : 'Animatsiyani to‘xtatish' }}
  </button>
</template>
