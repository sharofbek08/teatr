<script setup>
import { ArrowUpRight, Clock3, ChevronUp } from 'lucide-vue-next'
import { imageUrl } from '../../shared/content.mjs'
defineProps({
  performance: { type: Object, required: true },
  expanded: Boolean,
})
const weekdays = [
  'Yakshanba',
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba',
]
const weekday = (date) => weekdays[new Date(`${date}T12:00:00`).getDay()]
</script>

<template>
  <li
    :id="performance.id"
    class="repertoire-entry"
  >
    <article class="repertoire-row">
      <RouterLink
        class="repertoire-photo"
        :to="{
          path: '/repertuar',
          query: { show: performance.id },
          hash: `#${performance.id}`,
        }"
        :aria-label="`${performance.name} haqida batafsil`"
      >
        <img
          :src="imageUrl(performance.image, 600)"
          :alt="`${performance.name} sahnasidan tasvir`"
          loading="lazy"
          @error="$event.target.style.opacity = 0"
        />
        <span class="repertoire-age">{{ performance.age }}</span>
      </RouterLink>
      <time
        class="repertoire-date"
        :datetime="`${performance.dateISO}T${performance.time}`"
      >
        <strong>{{ performance.date.split(' ')[0] }}</strong>
        <span>{{ performance.date.split(' ').slice(1).join(' ') }}</span>
        <small>{{ weekday(performance.dateISO) }}</small>
      </time>
      <div class="repertoire-info">
        <p class="repertoire-genre">{{ performance.genre }}</p>
        <h2>
          <RouterLink
            :to="{
              path: '/repertuar',
              query: { show: performance.id },
              hash: `#${performance.id}`,
            }"
          >
            {{ performance.name }}
          </RouterLink>
        </h2>
        <p class="repertoire-time">
          <Clock3 :size="15" />
          {{ performance.time }}
          <span>·</span>
          THEATRO
        </p>
      </div>
      <div class="repertoire-actions">
        <RouterLink
          class="repertoire-details"
          :to="
            expanded
              ? { path: '/repertuar', hash: `#${performance.id}` }
              : {
                  path: '/repertuar',
                  query: { show: performance.id },
                  hash: `#${performance.id}`,
                }
          "
          :aria-expanded="expanded"
          :aria-controls="`details-${performance.id}`"
        >
          {{ expanded ? 'Yopish' : 'Batafsil' }}
          <ChevronUp
            v-if="expanded"
            :size="15"
          />
          <ArrowUpRight
            v-else
            :size="15"
          />
        </RouterLink>
        <span class="repertoire-sales">Chipta savdosi tez orada</span>
      </div>
    </article>
    <div
      v-if="expanded"
      :id="`details-${performance.id}`"
      class="repertoire-expanded"
    >
      <h3>{{ performance.name }} haqida</h3>
      <p>{{ performance.description }}</p>
      <p class="repertoire-demo-message">
        Demo spektakl. Onlayn chipta savdosi va bron qilish hali ishga
        tushirilmagan.
      </p>
    </div>
  </li>
</template>
