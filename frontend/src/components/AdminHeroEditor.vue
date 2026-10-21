<script setup>
import { computed, ref } from 'vue'
import {
  ArrowUpRight,
  Check,
  Eye,
  Film,
  ImagePlus,
  LoaderCircle,
  Monitor,
  RotateCcw,
  Save,
  UploadCloud,
} from 'lucide-vue-next'
import { imageUrl } from '../../shared/content.mjs'

const props = defineProps({
  hero: { type: Object, required: true },
  savedHero: { type: Object, required: true },
  busy: Boolean,
  files: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['upload', 'save', 'reset', 'remove-animation'])
const dragging = ref('')
const preview = ref('poster')
const changed = computed(
  () =>
    props.hero.poster !== props.savedHero.poster ||
    props.hero.animatedSrc !== props.savedHero.animatedSrc,
)
const previewSource = computed(() =>
  preview.value === 'animatedSrc' && props.hero.animatedSrc
    ? props.hero.animatedSrc
    : props.hero.poster,
)
const slots = [
  {
    field: 'poster',
    title: 'Muqova rasmi',
    subtitle: 'Sayt ochilganda birinchi ko‘rinadigan tasvir.',
    icon: ImagePlus,
    number: '01',
  },
  {
    field: 'animatedSrc',
    title: 'Jonli fon',
    subtitle: 'Sahnaga harakat qo‘shing. Bu ixtiyoriy.',
    icon: Film,
    number: '02',
  },
]

function selectFile(event, field) {
  const file = event.target.files?.[0]
  if (file && !props.busy) emit('upload', file, field)
  event.target.value = ''
}
function dropFile(event, field) {
  dragging.value = ''
  const file = event.dataTransfer.files?.[0]
  if (file && !props.busy) emit('upload', file, field)
}
function fileDescription(field) {
  const file = props.files[field]
  if (!file) return 'Joriy rasm'
  return `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`
}
</script>

<template>
  <form
    class="hero-studio"
    :aria-busy="busy"
    @submit.prevent="emit('save')"
  >
    <div class="hero-studio-layout">
      <section
        class="hero-upload-panel"
        aria-labelledby="hero-files-title"
      >
        <header class="hero-panel-heading">
          <span class="hero-heading-icon"><ImagePlus :size="21" /></span>
          <div>
            <h2 id="hero-files-title">Sahna uchun tasvirlar</h2>
            <p>Yangi ko‘rinish, yangi taassurot.</p>
          </div>
        </header>

        <div
          v-for="slot in slots"
          :key="slot.field"
          class="hero-upload-section"
        >
          <div class="hero-upload-title">
            <span>{{ slot.number }}</span>
            <div>
              <h3>
                {{ slot.title }}
                <small v-if="slot.field === 'animatedSrc'">IXTIYORIY</small>
              </h3>
              <p>{{ slot.subtitle }}</p>
            </div>
          </div>
          <label
            class="hero-dropzone"
            :class="{ 'is-dragging': dragging === slot.field, 'is-busy': busy }"
            @dragover.prevent="!busy && (dragging = slot.field)"
            @dragleave.prevent="dragging = ''"
            @drop.prevent="dropFile($event, slot.field)"
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              :disabled="busy"
              :aria-label="`${slot.title} faylini tanlash`"
              @change="selectFile($event, slot.field)"
            />
            <span class="hero-upload-symbol">
              <UploadCloud
                :size="26"
                :stroke-width="1.5"
              />
            </span>
            <strong>
              {{
                dragging === slot.field
                  ? 'Rasmni shu yerga tashlang'
                  : 'Rasmni tanlang yoki shu yerga tashlang'
              }}
            </strong>
            <span class="hero-file-formats">
              {{
                slot.field === 'poster'
                  ? 'JPG, PNG, WEBP, GIF'
                  : 'GIF, ANIMATSIYALI WEBP'
              }}
              <span>·</span>
              10 MB gacha
            </span>
            <span class="hero-browse-button">
              <component
                :is="slot.icon"
                :size="15"
              />
              {{ hero[slot.field] ? 'Rasmni almashtirish' : 'Fayl tanlash' }}
            </span>
          </label>

          <div
            v-if="hero[slot.field]"
            class="hero-current-file"
          >
            <img
              :src="imageUrl(hero[slot.field], 180)"
              :alt="slot.title"
            />
            <div>
              <strong>{{ fileDescription(slot.field) }}</strong>
              <span>
                <Check :size="12" />
                {{
                  hero[slot.field] === savedHero[slot.field]
                    ? 'Saytda saqlangan'
                    : 'Saqlashga tayyor'
                }}
              </span>
            </div>
            <button
              v-if="slot.field === 'animatedSrc'"
              type="button"
              :disabled="busy"
              class="hero-remove-file"
              @click="emit('remove-animation')"
            >
              Olib tashlash
            </button>
          </div>
        </div>
        <div class="hero-upload-tip">
          <Monitor :size="18" />
          <p>
            Keng formatdagi, sifatli rasm tanlang.
            <br />
            <strong>Tavsiya: 1920 × 1080 piksel yoki kattaroq.</strong>
          </p>
        </div>
      </section>

      <section
        class="hero-preview-panel"
        aria-labelledby="hero-preview-title"
      >
        <header class="hero-preview-heading">
          <div>
            <Eye :size="17" />
            <h2 id="hero-preview-title">Saytdagi ko‘rinish</h2>
          </div>
          <span class="hero-preview-badge">OLDINDAN KO‘RISH</span>
        </header>
        <div
          v-if="hero.animatedSrc"
          class="hero-preview-tabs"
          aria-label="Ko‘rinish turini tanlash"
        >
          <button
            type="button"
            :aria-pressed="preview === 'poster'"
            :class="{ active: preview === 'poster' }"
            @click="preview = 'poster'"
          >
            Muqova
          </button>
          <button
            type="button"
            :aria-pressed="preview === 'animatedSrc'"
            :class="{ active: preview === 'animatedSrc' }"
            @click="preview = 'animatedSrc'"
          >
            Animatsiya
          </button>
        </div>
        <div class="hero-preview-browser">
          <div class="hero-browser-toolbar">
            <span class="hero-browser-dots">
              <i></i>
              <i></i>
              <i></i>
            </span>
            <span>THEATRO / BOSH SAHIFA</span>
            <Monitor :size="13" />
          </div>
          <div class="hero-stage-preview">
            <img
              :key="previewSource"
              :src="imageUrl(previewSource, 1200)"
              alt="Tanlangan fon bilan bosh sahifa ko‘rinishi"
            />
            <div class="hero-stage-shade"></div>
            <div class="hero-stage-copy">
              <span>SAN’AT VA MADANIYAT MASKANI</span>
              <h3>
                Teatr —
                <br />
                qalblar
                <br />
                <em>ko‘zgusi.</em>
              </h3>
              <p>
                Bir oqshom. Ming tuyg‘u.
                <br />
                Unutilmas taassurotlar.
              </p>
              <span class="hero-stage-cta">
                Repertuarni ko‘rish
                <ArrowUpRight :size="14" />
              </span>
            </div>
            <span class="hero-stage-season">
              THEATRO
              <span>2026 — 2027</span>
            </span>
          </div>
        </div>
        <div class="hero-preview-caption">
          <span class="hero-status-dot"></span>
          Tanlangan rasm shu yerda ko‘rinadi. Saqlangach sayt yangilanadi.
        </div>
        <RouterLink
          to="/"
          target="_blank"
          rel="noopener"
          class="hero-open-site"
        >
          Saytni yangi oynada ochish
          <ArrowUpRight :size="15" />
        </RouterLink>
      </section>
    </div>

    <div class="hero-studio-savebar">
      <div
        class="hero-save-status"
        role="status"
      >
        <span
          class="hero-save-status-icon"
          :class="{ pending: changed }"
        >
          <LoaderCircle
            v-if="busy"
            :size="19"
            class="hero-loading-icon"
          />
          <Save
            v-else-if="changed"
            :size="19"
          />
          <Check
            v-else
            :size="19"
          />
        </span>
        <div>
          <strong>
            {{
              busy
                ? 'Bajarilmoqda…'
                : changed
                  ? 'Yangi ko‘rinish tayyor'
                  : 'Barcha o‘zgarishlar saqlangan'
            }}
          </strong>
          <p>
            {{
              busy
                ? 'Iltimos, jarayon tugashini kuting.'
                : changed
                  ? 'O‘zgarishlarni saytga qo‘llash uchun saqlang.'
                  : 'Istalgan vaqtda yangi rasm yuklashingiz mumkin.'
            }}
          </p>
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
          <RotateCcw :size="15" />
          Bekor qilish
        </button>
        <button
          class="admin-primary"
          :disabled="busy || !changed"
        >
          <LoaderCircle
            v-if="busy"
            :size="17"
            class="hero-loading-icon"
          />
          <Save
            v-else
            :size="17"
          />
          {{ busy ? 'Kutilmoqda…' : 'O‘zgarishlarni saqlash' }}
        </button>
      </div>
    </div>
  </form>
</template>
