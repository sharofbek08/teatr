<script setup>
import { Trophy, Sparkles, Drama } from 'lucide-vue-next'
import { achievements } from '../data/about'
const achievementIcons = [Drama, Trophy, Sparkles]
import '../assets/about.css'
</script>

<template>
  <section
    id="achievements"
    class="container inner-page about-detail-page"
    aria-labelledby="achievements-title"
  >
    <div class="about-section-heading">
      <div>
        <p class="eyebrow">IJODIY YO‘LIMIZ</p>
        <h1 id="achievements-title">
          Yutuqlar va
          <em>e’tiroflar</em>
        </h1>
      </div>
      <span class="about-demo-badge">Ma’lumotlar kutilmoqda</span>
    </div>
    <p class="about-section-intro">
      Ushbu bo‘lim tasdiqlangan yutuqlar bilan to‘ldiriladi. Quyidagi
      kartochkalar bo‘lim tuzilishini ko‘rsatadi.
    </p>
    <div class="achievements-grid">
      <article
        v-for="(item, index) in achievements"
        :key="item.id"
        class="achievement-card"
      >
        <component
          :is="achievementIcons[index % achievementIcons.length]"
          :size="30"
          :stroke-width="1.2"
          aria-hidden="true"
        />
        <p class="eyebrow">{{ item.category }}</p>
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </article>
    </div>
  </section>
</template>
