<script setup>
import { computed } from 'vue'
import {
  MapPin,
  Phone,
  Mail,
  Clock3,
  Save,
  RotateCcw,
  ArrowUpRight,
} from 'lucide-vue-next'
import { contactFields } from '../../shared/content.mjs'

const props = defineProps({
  contact: { type: Object, required: true },
  savedContact: { type: Object, required: true },
  busy: Boolean,
})
const emit = defineEmits(['update', 'save', 'reset'])
const changed = computed(
  () => JSON.stringify(props.contact) !== JSON.stringify(props.savedContact),
)
</script>

<template>
  <form
    class="admin-contact-form"
    :aria-busy="busy"
    @submit.prevent="emit('save')"
  >
    <div class="admin-about-layout">
      <section class="admin-panel">
        <div>
          <span class="admin-overline">BIZ BILAN BOG‘LANING</span>
          <h2>Aloqa ma’lumotlari</h2>
        </div>
        <label
          v-for="[key, label, type, required] in contactFields"
          :key="key"
          class="admin-field"
        >
          {{ label }}
          <textarea
            v-if="type === 'textarea'"
            :value="contact[key]"
            rows="3"
            maxlength="2000"
            :required="required"
            :disabled="busy"
            @input="emit('update', key, $event.target.value)"
          ></textarea>
          <input
            v-else
            :value="contact[key]"
            :type="type"
            maxlength="2000"
            :disabled="busy"
            :placeholder="
              key === 'phone'
                ? '+998 90 123 45 67'
                : key === 'email'
                  ? 'info@teatr.uz'
                  : 'https://…'
            "
            @input="emit('update', key, $event.target.value)"
          />
          <small v-if="key === 'mapUrl'">
            Google Maps havolasi yoki xaritani joylashtirish uchun embed havola
            kiriting (iframe kodidagi src). Bo‘sh bo‘lsa, xarita teatr manzili
            bo‘yicha ko‘rsatiladi. Qisqa havolalarda ham yozilgan manzil
            ishlatiladi.
          </small>
        </label>
      </section>
      <aside class="admin-panel admin-contact-preview">
        <span class="admin-overline">OLDINDAN KO‘RISH</span>
        <h2>Tomoshabinlar uchun</h2>
        <div>
          <MapPin :size="20" />
          <p>{{ contact.address || 'Teatr manzili' }}</p>
        </div>
        <div>
          <Phone :size="20" />
          <p>{{ contact.phone || 'Telefon kiritilmagan' }}</p>
        </div>
        <div>
          <Mail :size="20" />
          <p>{{ contact.email || 'Elektron pochta kiritilmagan' }}</p>
        </div>
        <div>
          <Clock3 :size="20" />
          <p>{{ contact.hours || 'Ish vaqti' }}</p>
        </div>
        <p
          v-if="contact.note"
          class="story-text"
        >
          {{ contact.note }}
        </p>
        <RouterLink
          to="/contact"
          target="_blank"
          rel="noopener"
          class="hero-open-site"
        >
          Aloqa sahifasini ko‘rish
          <ArrowUpRight :size="16" />
        </RouterLink>
      </aside>
    </div>
    <div class="hero-studio-savebar">
      <div class="hero-save-status">
        <span class="hero-save-status-icon"><Save :size="19" /></span>
        <div>
          <strong>
            {{
              busy
                ? 'Saqlanmoqda…'
                : changed
                  ? 'O‘zgarishlar saqlanmagan'
                  : 'Ma’lumotlar saqlangan'
            }}
          </strong>
          <p>Ma’lumotlar aloqa sahifasi va sayt footerida ko‘rinadi.</p>
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
