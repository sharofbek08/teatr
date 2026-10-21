import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/style.css'
import './assets/motion.css'
import reveal from './directives/reveal'
import { loadContent } from './data/content'
loadContent().finally(() => {
  createApp(App)
    .directive('reveal', reveal)
    .use(createPinia())
    .use(router)
    .mount('#app')
})
