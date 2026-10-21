<script setup>
import AboutGallery from '../components/AboutGallery.vue'
import '../assets/about.css'
</script>

<template>
  <section
    id="gallery"
    class="container inner-page about-detail-page"
    aria-labelledby="gallery-title"
  >
    <div class="about-section-heading">
      <div>
        <p class="eyebrow">SO‘ZLARSIZ HIKOYALAR</p>
        <h1 id="gallery-title">
          Teatr
          <em>galereyasi</em>
        </h1>
      </div>
      <span class="about-demo-badge">Namuna tasvirlar</span>
    </div>
    <p class="about-section-intro">
      Teatr muhitidan ilhomlangan tasvirlar. Rasmni kattalashtirish uchun ustiga
      bosing.
    </p>
    <AboutGallery />
    <p class="demo-note">
      Unsplash namuna tasvirlari. Ushbu suratlar THEATRO teatriga tegishli
      rasmiy fotohisobot emas.
    </p>
  </section>
</template>
