<script setup>
import { ArrowUpRight, Sparkles } from 'lucide-vue-next'
import PerformanceCard from '../components/PerformanceCard.vue'
import HeroMedia from '../components/HeroMedia.vue'
import { usePerformancesStore } from '../stores/performances'
const store = usePerformancesStore()
</script>
<template>
  <section class="hero">
    <HeroMedia />
    <div class="hero-shade"></div>
    <div class="container hero-content">
      <p class="eyebrow">
        <span></span>
        SAN’AT VA MADANIYAT MASKANI
      </p>
      <h1>
        Teatr —
        <br />
        qalblar
        <em>ko‘zgusi.</em>
      </h1>
      <p class="hero-description">
        Sizni unutilmas sahna asarlari, iste’dodli aktyorlar
        <br class="desktop-break" />
        va sehrli teatr olami kutmoqda.
      </p>
      <RouterLink
        to="/repertuar"
        class="button hero-cta"
      >
        Repertuarni ko‘rish
        <ArrowUpRight :size="18" />
      </RouterLink>
      <div class="hero-note">
        <span class="live-dot"></span>
        Yangi mavsum. Yangi hikoyalar.
      </div>
    </div>
    <div class="hero-bottom container">
      <span>HAR BIR PARDA ORTIDA — YANGI OLAM</span>
      <span class="season">
        MAVSUM
        <span>—</span>
        2026–2027
      </span>
    </div>
    <div class="hero-index">
      THEATRO
      <span>/ TOSHKENT</span>
    </div>
  </section>
  <div class="statement">
    <Sparkles :size="17" />
    <span>Bir sahna. Ming tuyg‘u. Unutilmas lahzalar.</span>
    <Sparkles :size="17" />
  </div>
  <section
    id="performances"
    class="section container"
  >
    <div class="section-top">
      <div>
        <p class="eyebrow">SAHNADA SIZNI KUTMOQDA</p>
        <h2>
          Yaqin
          <em>spektakllar</em>
        </h2>
      </div>
      <RouterLink
        to="/repertuar"
        class="text-link"
      >
        Barcha spektakllar
        <ArrowUpRight :size="18" />
      </RouterLink>
    </div>
    <div class="performance-grid">
      <PerformanceCard
        v-for="performance in store.performances"
        :key="performance.id"
        :performance="performance"
      />
    </div>
    <p class="demo-note">
      Demo repertuar · Sanalar va spektakllar namuna sifatida keltirilgan.
    </p>
  </section>
  <section class="invitation container">
    <div>
      <p class="eyebrow">O‘ZINGIZGA BIR OQSHOM BAG‘ISHLANG</p>
      <h2>
        Sehrli lahzalar
        <em>sizni kutmoqda.</em>
      </h2>
    </div>
    <RouterLink
      to="/repertuar"
      class="button"
    >
      Spektakl tanlash
      <ArrowUpRight :size="18" />
    </RouterLink>
  </section>
</template>
