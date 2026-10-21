<script setup>
import { Drama, ArrowUpRight } from 'lucide-vue-next'
import { content } from '../data/content'
import { socialIcon } from '../data/socialIcons'
</script>
<template>
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <RouterLink
          to="/"
          class="brand"
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
        <p>
          San’at qalblarni birlashtiradi.
          <br />
          Har bir tashrif — yangi taassurot.
        </p>
      </div>
      <div class="footer-theatre-group">
        <div>
          <h4>Teatr</h4>
          <nav
            class="footer-navigation"
            aria-label="Footer navigatsiyasi"
          >
            <RouterLink to="/">Bosh sahifa</RouterLink>
            <RouterLink to="/repertuar">Repertuar</RouterLink>
            <RouterLink to="/about">Teatr haqida</RouterLink>
            <RouterLink to="/contact">Aloqa</RouterLink>
          </nav>
        </div>
        <div class="footer-creative-links">
          <h4>Ijodiy hayot</h4>
          <nav
            class="footer-navigation"
            aria-label="Teatr bo‘limlari"
          >
            <RouterLink to="/about/actors">Aktyorlar</RouterLink>
            <RouterLink to="/about/achievements">Yutuqlar</RouterLink>
            <RouterLink to="/about/gallery">Galereya</RouterLink>
          </nav>
        </div>
      </div>
      <div>
        <h4>Biz bilan bog‘laning</h4>
        <p>
          {{ content.contact.address }}
        </p>
        <a
          v-if="content.contact.phone"
          :href="`tel:${content.contact.phone.replace(/[^\d+]/g, '')}`"
        >
          {{ content.contact.phone }}
        </a>
        <a
          v-if="content.contact.email"
          :href="`mailto:${encodeURIComponent(content.contact.email)}`"
        >
          {{ content.contact.email }}
        </a>
        <RouterLink
          class="footer-contact"
          to="/contact"
        >
          Aloqa ma’lumotlari
          <ArrowUpRight :size="14" />
        </RouterLink>
      </div>
      <div>
        <h4>Ijtimoiy tarmoqlar</h4>
        <div
          v-if="content.socialLinks.length"
          class="socials"
        >
          <a
            v-for="social in content.socialLinks"
            :key="social.id"
            :href="social.url"
            :aria-label="`${social.name} — yangi oynada ochish`"
            :title="social.name"
            target="_blank"
            rel="noopener noreferrer"
          >
            <component
              :is="socialIcon(social)"
              :size="18"
            />
          </a>
        </div>
        <small v-else>Rasmiy sahifalar tez orada.</small>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© 2026 THEATRO. Barcha huquqlar himoyalangan.</span>
      <span>San’atga muhabbat bilan yaratilgan.</span>
      <RouterLink to="/admin">Admin panel</RouterLink>
    </div>
  </footer>
</template>
