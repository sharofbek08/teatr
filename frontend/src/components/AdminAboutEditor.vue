<script setup>
import { computed } from 'vue'
import { ImagePlus, Save, RotateCcw, ArrowUpRight } from 'lucide-vue-next'
import { imageUrl } from '../../shared/content.mjs'

const props = defineProps({
  about: { type: Object, required: true },
  savedAbout: { type: Object, required: true },
  busy: Boolean,
})
const emit = defineEmits(['update', 'upload', 'save', 'reset'])
const changed = computed(
  () => JSON.stringify(props.about) !== JSON.stringify(props.savedAbout),
)
const fields = [
  ['eyebrow', 'Kichik sarlavha'],
  ['title', 'Asosiy sarlavha'],
  ['accent', 'Ajratib ko‘rsatilgan so‘z (ixtiyoriy)'],
  ['subtitle', 'Ichki sarlavha'],
  ['body', 'Teatr haqida ma’lumot'],
  ['imageAlt', 'Rasm tavsifi'],
  ['note', 'Qo‘shimcha izoh (ixtiyoriy)'],
]
function chooseImage(event) {
  const file = event.target.files?.[0]
  if (file) emit('upload', file)
  event.target.value = ''
}
</script>

<template>
  <form
    class="admin-about-form"
    :aria-busy="busy"
    @submit.prevent="emit('save')"
  >
    <div class="admin-about-layout">
      <section class="admin-panel">
        <div>
          <span class="admin-overline">BIZNING HIKOYAMIZ</span>
          <h2>Teatringiz haqida so‘zlang</h2>
        </div>
        <label
          v-for="[key, label] in fields"
          :key="key"
          class="admin-field"
        >
          {{ label }}
          <textarea
            v-if="key === 'body' || key === 'subtitle'"
            :value="about[key]"
            :rows="key === 'body' ? 10 : 2"
            :maxlength="key === 'body' ? 20000 : 500"
            :disabled="busy"
            required
            @input="emit('update', key, $event.target.value)"
          ></textarea>
          <input
            v-else
            :value="about[key]"
            :required="!['accent', 'note'].includes(key)"
            :maxlength="['accent', 'note'].includes(key) ? 5000 : 500"
            :disabled="busy"
            @input="emit('update', key, $event.target.value)"
          />
          <small v-if="key === 'body'">
            Yangi paragraf boshlash uchun bir qator bo‘sh qoldiring.
          </small>
        </label>
      </section>
      <aside class="admin-about-media admin-panel">
        <h2>Sahifa rasmi</h2>
        <img
          :src="imageUrl(about.image, 900)"
          :alt="about.imageAlt"
          class="admin-about-image"
        />
        <label class="hero-dropzone">
          <span class="hero-upload-symbol"><ImagePlus :size="25" /></span>
          <strong>Kompyuterdan rasm tanlang</strong>
          <span class="hero-file-formats">
            JPG, PNG, WEBP, GIF · 10 MB gacha
          </span>
          <span class="hero-browse-button">Rasmni almashtirish</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            :disabled="busy"
            aria-label="Teatr haqida sahifasi uchun rasm tanlash"
            @change="chooseImage"
          />
        </label>
        <RouterLink
          to="/about"
          target="_blank"
          rel="noopener"
          class="hero-open-site"
        >
          Sahifani ko‘rish
          <ArrowUpRight :size="16" />
        </RouterLink>
      </aside>
    </div>
    <div class="hero-studio-savebar admin-about-savebar">
      <div class="hero-save-status">
        <span class="hero-save-status-icon"><Save :size="19" /></span>
        <div>
          <strong>
            {{ changed ? 'O‘zgarishlar saqlanmagan' : 'Ma’lumotlar saqlangan' }}
          </strong>
          <p>Saqlangan ma’lumot “Teatr haqida” sahifasida ko‘rinadi.</p>
        </div>
      </div>
      <div class="hero-save-actions">
        <button
          v-if="changed"
          type="button"
          class="admin-secondary"
          :disabled="busy"
          @click="emit('reset')"
        >
          <RotateCcw :size="16" />
          Bekor qilish
        </button>
        <button
          class="admin-primary"
          :disabled="busy || !changed"
        >
          <Save :size="17" />
          {{ busy ? 'Kutilmoqda…' : 'Saqlash' }}
        </button>
      </div>
    </div>
  </form>
</template>
