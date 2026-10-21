<script setup>
import { ArrowRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { content } from '../data/content'
import { imageUrl } from '../../shared/content.mjs'
const paragraphs = computed(() =>
  content.about.body.split(/\n\s*\n/).filter((text) => text.trim()),
)
</script>

<template>
  <div class="container inner-page story-page">
    <section aria-labelledby="about-title">
      <p class="eyebrow">{{ content.about.eyebrow }}</p>
      <h1 id="about-title">
        {{ content.about.title }}
        <em v-if="content.about.accent">{{ content.about.accent }}</em>
      </h1>
      <div class="story-layout">
        <img
          :key="content.about.image"
          :src="imageUrl(content.about.image, 1000)"
          :alt="content.about.imageAlt"
          @error="$event.target.style.opacity = 0"
        />
        <div>
          <h2 class="story-text">{{ content.about.subtitle }}</h2>
          <p
            v-for="(paragraph, index) in paragraphs"
            :key="index"
            class="story-text"
          >
            {{ paragraph }}
          </p>
          <p
            v-if="content.about.note"
            class="demo-note"
          >
            {{ content.about.note }}
          </p>
          <RouterLink
            to="/repertuar"
            class="text-link"
          >
            Repertuarni ko‘rish
            <ArrowRight :size="18" />
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
