<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { useRoute } from 'vue-router'
const currentRoute = useRoute()
</script>
<template>
  <a
    class="skip-link"
    href="#main"
  >
    Asosiy mazmunga o‘tish
  </a>
  <Navbar v-if="!currentRoute.meta.admin" />
  <main
    id="main"
    v-reveal
  >
    <RouterView v-slot="{ Component, route }">
      <Transition
        name="route"
        :duration="{ enter: 350, leave: 0 }"
      >
        <div
          :key="route.path"
          class="page-content"
        >
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </main>
  <Footer
    v-if="!currentRoute.meta.admin"
    v-reveal
  />
</template>
