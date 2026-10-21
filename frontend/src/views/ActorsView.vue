<script setup>
import { UserRound } from 'lucide-vue-next'
import { actors } from '../data/about'
import '../assets/about.css'
</script>

<template>
  <section
    id="actors"
    class="container inner-page about-detail-page"
    aria-labelledby="actors-title"
  >
    <div class="about-section-heading">
      <div>
        <p class="eyebrow">SAHNAGA HAYOT BAG‘ISHLAYDIGANLAR</p>
        <h1 id="actors-title">
          Bizning
          <em>aktyorlar</em>
        </h1>
      </div>
      <span class="about-demo-badge">Namuna jamoa</span>
    </div>
    <p class="about-section-intro">
      Har bir obraz ortida iste’dod, izlanish va san’atga muhabbat bor. Rasmiy
      jamoa ma’lumotlari tez orada qo‘shiladi.
    </p>
    <div class="actors-grid">
      <article
        v-for="actor in actors"
        :key="actor.id"
        class="actor-card"
      >
        <div class="actor-portrait">
          <span class="actor-number">{{ actor.initials }}</span>
          <UserRound
            :size="80"
            :stroke-width="0.7"
            aria-hidden="true"
          />
          <span class="actor-photo-label">Portret tez orada</span>
        </div>
        <div class="actor-content">
          <p class="eyebrow">{{ actor.role }}</p>
          <h3>{{ actor.name }}</h3>
          <p>{{ actor.description }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
