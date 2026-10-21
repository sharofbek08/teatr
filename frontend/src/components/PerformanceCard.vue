<script setup>
import { ArrowUpRight, CalendarDays, Clock3 } from 'lucide-vue-next'
import { imageUrl } from '../../shared/content.mjs'
defineProps({ performance: { type: Object, required: true } })
</script>
<template>
  <article class="performance-card">
    <RouterLink
      :to="`/repertuar?show=${performance.id}#${performance.id}`"
      class="poster"
      :aria-label="`${performance.name} haqida batafsil`"
    >
      <img
        :src="imageUrl(performance.image, 900)"
        :alt="`${performance.name} — sahna tasviri`"
        loading="lazy"
        @error="$event.target.style.opacity = 0"
      />
      <span class="age">{{ performance.age }}</span>
      <span class="poster-caption">
        THEATRO
        <span>2026 / 27</span>
      </span>
    </RouterLink>
    <div class="card-content">
      <span class="genre">{{ performance.genre }}</span>
      <h3>{{ performance.name }}</h3>
      <div class="card-bottom">
        <div class="show-meta">
          <span>
            <CalendarDays :size="14" />
            {{ performance.date }}
          </span>
          <span>
            <Clock3 :size="14" />
            {{ performance.time }}
          </span>
        </div>
        <RouterLink
          class="detail-link"
          :to="`/repertuar?show=${performance.id}#${performance.id}`"
        >
          Batafsil
          <ArrowUpRight :size="16" />
        </RouterLink>
      </div>
    </div>
  </article>
</template>
