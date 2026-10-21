<script setup>
import { MapPin, Phone, Clock3, ArrowRight } from 'lucide-vue-next'
import { content } from '../data/content'
import { computed } from 'vue'
import { contactMap } from '../../shared/map.mjs'
const map = computed(() => contactMap(content.contact))
</script>
<template>
  <section class="container inner-page">
    <p class="eyebrow">SIZNI KUTAMIZ</p>
    <h1>
      Teatrga
      <em>marhamat.</em>
    </h1>
    <p class="intro">Uchrashuvimiz sahnadan boshlanadi.</p>
    <div class="contact-grid">
      <article>
        <MapPin />
        <h2>Manzil</h2>
        <p class="story-text">{{ content.contact.address }}</p>
        <a
          v-if="content.contact.mapUrl"
          :href="content.contact.mapUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-link"
        >
          Xaritada ko‘rish
          <ArrowRight :size="15" />
        </a>
      </article>
      <article>
        <Phone />
        <h2>Bog‘lanish</h2>
        <p v-if="content.contact.phone">
          <a :href="`tel:${content.contact.phone.replace(/[^\d+]/g, '')}`">
            {{ content.contact.phone }}
          </a>
        </p>
        <p v-if="content.contact.email">
          <a :href="`mailto:${encodeURIComponent(content.contact.email)}`">
            {{ content.contact.email }}
          </a>
        </p>
        <p v-if="!content.contact.phone && !content.contact.email">
          Aloqa ma’lumotlari tayyorlanmoqda.
        </p>
      </article>
      <article>
        <Clock3 />
        <h2>Kassa ish vaqti</h2>
        <p class="story-text">{{ content.contact.hours }}</p>
      </article>
    </div>
    <section
      class="contact-map"
      aria-labelledby="contact-map-title"
    >
      <header class="contact-map-heading">
        <div>
          <p class="eyebrow">BIZNI XARITADAN TOPING</p>
          <h2 id="contact-map-title">Teatrga yo‘l</h2>
          <p>{{ content.contact.address }}</p>
        </div>
        <a
          :href="map.link"
          target="_blank"
          rel="noopener noreferrer"
          class="text-link"
        >
          Xaritada ochish
          <ArrowRight :size="17" />
        </a>
      </header>
      <iframe
        :key="map.embed"
        :src="map.embed"
        :title="`Teatr joylashuvi: ${content.contact.address}`"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen
      ></iframe>
      <p class="contact-map-caption">
        Xarita yuklanmasa, “Xaritada ochish” havolasidan foydalaning.
      </p>
    </section>
    <div
      v-if="content.contact.note"
      class="notice story-text"
    >
      {{ content.contact.note }}
    </div>
    <RouterLink
      to="/repertuar"
      class="text-link"
    >
      Spektakllarni ko‘rish
      <ArrowRight :size="18" />
    </RouterLink>
  </section>
</template>
