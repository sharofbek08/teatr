import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/admin',
      component: () => import('../views/AdminView.vue'),
      meta: { title: 'Admin panel', admin: true },
    },
    { path: '/', component: HomeView, meta: { title: 'Bosh sahifa' } },
    {
      path: '/repertuar',
      component: () => import('../views/RepertuarView.vue'),
      meta: { title: 'Repertuar' },
    },
    {
      path: '/about',
      component: () => import('../views/AboutView.vue'),
      meta: { title: 'Teatr haqida' },
    },
    {
      path: '/contact',
      component: () => import('../views/ContactView.vue'),
      meta: { title: 'Aloqa' },
    },
    {
      path: '/about/actors',
      component: () => import('../views/ActorsView.vue'),
      meta: { title: 'Aktyorlar' },
    },
    {
      path: '/about/achievements',
      component: () => import('../views/AchievementsView.vue'),
      meta: { title: 'Yutuqlar' },
    },
    {
      path: '/about/gallery',
      component: () => import('../views/GalleryView.vue'),
      meta: { title: 'Galereya' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      const element = document.getElementById(
        decodeURIComponent(to.hash.slice(1)),
      )
      if (element)
        return {
          el: element,
          top: 110,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'instant'
            : 'smooth',
        }
    }
    return { top: 0 }
  },
})
router.afterEach((to) => {
  document.title = `${to.meta.title} · THEATRO`
})
export default router
