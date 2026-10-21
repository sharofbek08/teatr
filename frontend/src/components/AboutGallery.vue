<script setup>
import { ref, computed } from 'vue'
import { Expand, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { gallery } from '../data/about'
import { imageUrl as getImageUrl } from '../../shared/content.mjs'
const viewer = ref(null)
const currentIndex = ref(0)
const current = computed(() => gallery[currentIndex.value])
const imageUrl = (item, width) => getImageUrl(item.image, width)
function openImage(index) {
  currentIndex.value = index
  viewer.value.showModal()
}
function move(step) {
  if (!gallery.length) return
  currentIndex.value =
    (currentIndex.value + step + gallery.length) % gallery.length
}
</script>

<template>
  <div class="about-gallery-grid">
    <button
      v-for="(item, index) in gallery"
      :key="item.id"
      class="gallery-tile"
      :aria-label="`${item.title} — kattalashtirish`"
      @click="openImage(index)"
    >
      <img
        :src="imageUrl(item, 900)"
        :alt="item.title"
        loading="lazy"
        @error="$event.target.style.opacity = 0"
      />
      <span class="gallery-expand"><Expand :size="18" /></span>
      <span class="gallery-caption">
        <small>{{ item.category }}</small>
        <span>{{ item.title }}</span>
      </span>
    </button>
  </div>
  <dialog
    v-if="current"
    ref="viewer"
    class="gallery-viewer"
    aria-labelledby="gallery-image-title"
    @click="$event.target === viewer && viewer.close()"
    @keydown.left.prevent="move(-1)"
    @keydown.right.prevent="move(1)"
  >
    <div class="gallery-viewer-inner">
      <button
        class="gallery-close"
        aria-label="Galereyani yopish"
        autofocus
        @click="viewer.close()"
      >
        <X />
      </button>
      <img
        :key="current.id"
        :src="imageUrl(current, 1800)"
        :alt="current.title"
        @error="$event.target.style.opacity = 0"
      />
      <div class="gallery-viewer-bottom">
        <button
          class="gallery-control"
          aria-label="Oldingi rasm"
          @click="move(-1)"
        >
          <ChevronLeft />
        </button>
        <div>
          <p id="gallery-image-title">{{ current.title }}</p>
          <small>
            {{ currentIndex + 1 }} / {{ gallery.length }} · Namuna tasvir
          </small>
        </div>
        <button
          class="gallery-control"
          aria-label="Keyingi rasm"
          @click="move(1)"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  </dialog>
</template>
