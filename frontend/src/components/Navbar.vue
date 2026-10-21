<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Drama, Menu, X, ChevronDown } from 'lucide-vue-next'
const open = ref(false)
const aboutOpen = ref(false)
const route = useRoute()
let desktopPreference
function closeMenusOnResize() {
  open.value = false
  aboutOpen.value = false
}
onMounted(() => {
  desktopPreference = window.matchMedia('(min-width: 1001px)')
  desktopPreference.addEventListener('change', closeMenusOnResize)
})
onBeforeUnmount(() => {
  desktopPreference?.removeEventListener('change', closeMenusOnResize)
})
watch(
  () => route.fullPath,
  () => {
    open.value = false
    aboutOpen.value = false
  },
)
const links = [
  { to: '/', label: 'Bosh sahifa' },
  { to: '/repertuar', label: 'Repertuar' },
  { to: '/about', label: 'Teatr haqida' },
  { to: '/contact', label: 'Aloqa' },
]
const aboutLinks = [
  { to: '/about/actors', label: 'Aktyorlar' },
  { to: '/about/achievements', label: 'Yutuqlar' },
  { to: '/about/gallery', label: 'Galereya' },
]
function closeOnFocusLeave(event) {
  if (!event.currentTarget.contains(event.relatedTarget))
    aboutOpen.value = false
}
</script>

<template>
  <header class="navbar">
    <div class="container nav-inner">
      <RouterLink
        to="/"
        class="brand"
        aria-label="THEATRO bosh sahifa"
      >
        <Drama
          :size="35"
          :stroke-width="1.2"
        />
        <span>
          THEATRO
          <small>SAN’AT VA MADANIYAT</small>
        </span>
      </RouterLink>
      <nav
        class="desktop-nav"
        aria-label="Asosiy navigatsiya"
      >
        <template
          v-for="link in links"
          :key="link.to"
        >
          <div
            v-if="link.to === '/about'"
            class="nav-about"
            @mouseenter="aboutOpen = true"
            @mouseleave="aboutOpen = false"
            @focusout="closeOnFocusLeave"
            @keydown.esc.prevent="aboutOpen = false"
          >
            <div class="nav-about-label">
              <RouterLink
                :to="link.to"
                :class="{
                  'router-link-exact-active': route.path.startsWith('/about'),
                }"
              >
                {{ link.label }}
              </RouterLink>
              <button
                class="about-menu-toggle"
                aria-label="Teatr haqida ichki menyusi"
                :aria-expanded="aboutOpen"
                aria-controls="about-submenu"
                @click="aboutOpen = !aboutOpen"
              >
                <ChevronDown :size="13" />
              </button>
            </div>
            <div
              v-show="aboutOpen"
              id="about-submenu"
              class="about-submenu"
            >
              <RouterLink
                v-for="item in aboutLinks"
                :key="item.to"
                :to="item.to"
                @click="aboutOpen = false"
              >
                {{ item.label }}
              </RouterLink>
            </div>
          </div>
          <RouterLink
            v-else
            :to="link.to"
          >
            {{ link.label }}
          </RouterLink>
        </template>
      </nav>
      <button
        class="menu-toggle"
        :aria-expanded="open"
        aria-controls="mobile-navigation"
        :aria-label="open ? 'Menyuni yopish' : 'Menyuni ochish'"
        @click="open = !open"
      >
        <X v-if="open" />
        <Menu v-else />
      </button>
    </div>
    <nav
      v-if="open"
      id="mobile-navigation"
      class="mobile-nav"
      aria-label="Mobil navigatsiya"
      @keydown.esc="open = false"
    >
      <template
        v-for="link in links"
        :key="link.to"
      >
        <RouterLink
          :to="link.to"
          @click="open = false"
        >
          {{ link.label }}
        </RouterLink>
        <div
          v-if="link.to === '/about'"
          class="mobile-about-links"
        >
          <RouterLink
            v-for="item in aboutLinks"
            :key="item.to"
            :to="item.to"
            @click="open = false"
          >
            {{ item.label }}
          </RouterLink>
        </div>
      </template>
    </nav>
  </header>
</template>
