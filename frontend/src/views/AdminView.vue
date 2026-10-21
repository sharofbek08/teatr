<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  Drama,
  LayoutDashboard,
  CalendarDays,
  Users,
  Trophy,
  Images,
  Image,
  Globe,
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  LogOut,
  X,
  Save,
  Search,
  Check,
  LockKeyhole,
  Phone,
} from 'lucide-vue-next'
import { content, applyContent } from '../data/content'
import {
  sections,
  imageUrl,
  validateContent,
  socialIconOptions,
} from '../../shared/content.mjs'
import '../assets/admin.css'
import AdminHeroEditor from '../components/AdminHeroEditor.vue'
import AdminAboutEditor from '../components/AdminAboutEditor.vue'
import AdminContactEditor from '../components/AdminContactEditor.vue'
import { socialIcon } from '../data/socialIcons'

const authenticated = ref(false)
const checking = ref(true)
const busy = ref(false)
const password = ref('')
const error = ref('')
const notice = ref('')
const active = ref('dashboard')
const search = ref('')
const editor = ref(null)
const draft = ref({})
const editingId = ref(null)
const deleting = ref(null)
const deleteDialog = ref(null)
const hero = ref({ ...content.heroMedia })
const heroFiles = ref({})
const about = ref({ ...content.about })
const contact = ref({ ...content.contact })
const pageTitle = computed(
  () =>
    activeSection.value?.label ||
    { hero: 'Bosh sahifa rasmi', about: 'Teatr haqida', contact: 'Aloqa' }[
      active.value
    ] ||
    'Umumiy ko‘rinish',
)
const icons = {
  performances: CalendarDays,
  actors: Users,
  achievements: Trophy,
  gallery: Images,
  socialLinks: Globe,
}
const activeSection = computed(() => sections[active.value])
const items = computed(() =>
  (content[active.value] || []).filter((item) =>
    `${item.name || item.title} ${item.genre || item.role || item.category || item.url || ''}`
      .toLocaleLowerCase()
      .includes(search.value.toLocaleLowerCase()),
  ),
)
const total = computed(() =>
  Object.keys(sections).reduce((sum, key) => sum + content[key].length, 0),
)

async function api(path, options = {}) {
  let response
  try {
    response = await fetch(`/api/${path}`, {
      ...options,
      headers: options.method
        ? {
            'Content-Type':
              options.body instanceof Blob
                ? options.body.type
                : 'application/json',
          }
        : undefined,
      body:
        options.body instanceof Blob
          ? options.body
          : options.body
            ? JSON.stringify(options.body)
            : undefined,
    })
  } catch {
    throw new Error('Server bilan aloqa yo‘q. Qayta urinib ko‘ring.')
  }
  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(
      'Admin server ishga tushirilmagan. npm run dev orqali ishga tushiring.',
    )
  }
  if (!response.ok) {
    if (response.status === 401 && path !== 'login') {
      authenticated.value = false
      editor.value?.close()
      deleteDialog.value?.close()
      deleting.value = null
    }
    throw new Error(data.error || 'So‘rov bajarilmadi.')
  }
  return data
}
onMounted(async () => {
  try {
    authenticated.value = (await api('session')).authenticated
    if (authenticated.value) applyContent(await api('content'))
  } catch (reason) {
    error.value = reason.message
  } finally {
    checking.value = false
  }
})
async function login() {
  busy.value = true
  error.value = ''
  try {
    await api('login', { method: 'POST', body: { password: password.value } })
    applyContent(await api('content'))
    hero.value = { ...content.heroMedia }
    authenticated.value = true
    password.value = ''
  } catch (reason) {
    error.value = reason.message
  } finally {
    busy.value = false
  }
}
async function logout() {
  busy.value = true
  error.value = ''
  try {
    await api('logout', { method: 'POST', body: {} })
    authenticated.value = false
    notice.value = ''
  } catch (reason) {
    error.value = reason.message
  } finally {
    busy.value = false
  }
}
function navigate(key) {
  active.value = key
  search.value = ''
  notice.value = ''
  error.value = ''
  if (key === 'hero') resetHero()
  if (key === 'about') about.value = { ...content.about }
  if (key === 'contact') contact.value = { ...content.contact }
}
function openEditor(item) {
  editingId.value = item?.id ?? null
  draft.value = item
    ? { ...item }
    : Object.fromEntries(activeSection.value.fields.map(([key]) => [key, '']))
  if (active.value === 'socialLinks') draft.value.icon ||= 'auto'
  if (!item && active.value === 'performances')
    Object.assign(draft.value, { time: '19:00', age: '12+' })
  error.value = ''
  notice.value = ''
  editor.value.showModal()
}
function requestDelete(item) {
  error.value = ''
  notice.value = ''
  deleting.value = item
  deleteDialog.value.showModal()
}
async function persist(next) {
  validateContent(next)
  applyContent(await api('content', { method: 'PUT', body: next }))
  notice.value = 'O‘zgarishlar saqlandi. Sayt yangilandi.'
}
async function saveItem() {
  busy.value = true
  error.value = ''
  try {
    const next = JSON.parse(JSON.stringify(content))
    const item = { ...draft.value, id: editingId.value ?? crypto.randomUUID() }
    for (const key of Object.keys(item))
      if (typeof item[key] === 'string') item[key] = item[key].trim()
    if (editingId.value !== null) {
      const index = next[active.value].findIndex(
        (value) => value.id === editingId.value,
      )
      next[active.value][index] = item
    } else next[active.value].push(item)
    await persist(next)
    editor.value.close()
  } catch (reason) {
    error.value = reason.message
  } finally {
    busy.value = false
  }
}
async function deleteItem() {
  busy.value = true
  error.value = ''
  try {
    const next = JSON.parse(JSON.stringify(content))
    next[active.value] = next[active.value].filter(
      (item) => item.id !== deleting.value.id,
    )
    await persist(next)
    deleteDialog.value.close()
    deleting.value = null
  } catch (reason) {
    error.value = reason.message
  } finally {
    busy.value = false
  }
}
function resetHero() {
  hero.value = { ...content.heroMedia }
  heroFiles.value = {}
  notice.value = ''
  error.value = ''
}
async function uploadHero(file, field, target = 'hero') {
  if (!file) return
  error.value = ''
  notice.value = ''
  busy.value = true
  try {
    if (
      !['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(
        file.type,
      )
    )
      throw new Error('PNG, JPG, WebP yoki GIF rasm tanlang.')
    if (file.size > 10 * 1024 * 1024)
      throw new Error('Rasm hajmi 10 MB dan oshmasligi kerak.')
    const uploaded = await api('uploads', { method: 'POST', body: file })
    if (target === 'draft') draft.value[field] = uploaded.url
    else if (target === 'about') about.value.image = uploaded.url
    else {
      hero.value[field] = uploaded.url
      heroFiles.value[field] = { name: file.name, size: file.size }
    }
    notice.value =
      'Rasm yuklandi. Saytga qo‘llash uchun Saqlash tugmasini bosing.'
  } catch (reason) {
    error.value = reason.message
  } finally {
    busy.value = false
  }
}
async function uploadRecordImage(event, field) {
  const file = event.target.files?.[0]
  if (!file) return
  await uploadHero(file, field, 'draft')
  event.target.value = ''
}
async function saveHero() {
  busy.value = true
  error.value = ''
  try {
    const next = JSON.parse(JSON.stringify(content))
    next.heroMedia = {
      poster: hero.value.poster.trim(),
      animatedSrc: hero.value.animatedSrc.trim(),
    }
    await persist(next)
  } catch (reason) {
    error.value = reason.message
  } finally {
    busy.value = false
  }
}
async function saveAbout() {
  busy.value = true
  error.value = ''
  try {
    const next = JSON.parse(JSON.stringify(content))
    next.about = Object.fromEntries(
      Object.entries(about.value).map(([key, value]) => [key, value.trim()]),
    )
    await persist(next)
    about.value = { ...content.about }
  } catch (reason) {
    error.value = reason.message
  } finally {
    busy.value = false
  }
}
async function saveContact() {
  busy.value = true
  error.value = ''
  try {
    const next = JSON.parse(JSON.stringify(content))
    next.contact = Object.fromEntries(
      Object.entries(contact.value).map(([key, value]) => [key, value.trim()]),
    )
    await persist(next)
    contact.value = { ...content.contact }
  } catch (reason) {
    error.value = reason.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="admin-app">
    <div
      v-if="checking"
      class="admin-loading"
      role="status"
    >
      Admin panel yuklanmoqda…
    </div>
    <div
      v-else-if="!authenticated"
      class="admin-login-layout"
    >
      <div class="admin-login-story">
        <RouterLink
          to="/"
          class="admin-brand"
        >
          <Drama :size="36" />
          THEATRO
        </RouterLink>
        <div>
          <span class="admin-overline">SAHNA ORTIDAGI BOSHQARUV</span>
          <h1>
            Buyuk hikoyalar
            <br />
            <em>shu yerdan boshlanadi.</em>
          </h1>
          <p>Teatr repertuari va ijodiy hayotini bir joydan boshqaring.</p>
        </div>
        <span class="admin-login-caption">SAN’AT VA MADANIYAT MASKANI</span>
      </div>
      <div class="admin-login-form-wrap">
        <form
          class="admin-login-form"
          @submit.prevent="login"
        >
          <span class="admin-lock"><LockKeyhole :size="26" /></span>
          <span class="admin-overline">XUSH KELIBSIZ</span>
          <h2>Admin panelga kirish</h2>
          <p>Boshqaruvni boshlash uchun admin parolini kiriting.</p>
          <label class="admin-field">
            Parol
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              maxlength="1024"
              placeholder="Parolingizni kiriting"
            />
          </label>
          <p
            v-if="error"
            class="admin-error"
            role="alert"
          >
            {{ error }}
          </p>
          <button
            class="admin-primary"
            :disabled="busy"
          >
            {{ busy ? 'Tekshirilmoqda…' : 'Kirish' }}
            <ArrowUpRight :size="18" />
          </button>
          <RouterLink
            to="/"
            class="admin-back"
          >
            ← Saytga qaytish
          </RouterLink>
        </form>
      </div>
    </div>
    <div
      v-else
      class="admin-shell"
    >
      <aside class="admin-sidebar">
        <RouterLink
          to="/"
          class="admin-brand"
        >
          <Drama :size="30" />
          THEATRO
        </RouterLink>
        <span class="admin-sidebar-caption">BOSHQARUV PANELI</span>
        <nav aria-label="Admin bo‘limlari">
          <button
            :class="{ selected: active === 'dashboard' }"
            @click="navigate('dashboard')"
          >
            <LayoutDashboard :size="18" />
            Umumiy ko‘rinish
          </button>
          <span class="admin-nav-label">KONTENT</span>
          <button
            v-for="(section, key) in sections"
            :key="key"
            :class="{ selected: active === key }"
            @click="navigate(key)"
          >
            <component
              :is="icons[key]"
              :size="18"
            />
            {{ section.label }}
            <small>{{ content[key].length }}</small>
          </button>
          <button
            :class="{ selected: active === 'contact' }"
            @click="navigate('contact')"
          >
            <Phone :size="18" />
            Aloqa
          </button>
          <button
            :class="{ selected: active === 'about' }"
            @click="navigate('about')"
          >
            <Drama :size="18" />
            Teatr haqida
          </button>
          <button
            :class="{ selected: active === 'hero' }"
            @click="navigate('hero')"
          >
            <Image :size="18" />
            Bosh sahifa rasmi
          </button>
        </nav>
        <div class="admin-sidebar-bottom">
          <RouterLink
            to="/"
            target="_blank"
            rel="noopener"
          >
            Saytni ko‘rish
            <ArrowUpRight :size="17" />
          </RouterLink>
          <button
            :disabled="busy"
            @click="logout"
          >
            <LogOut :size="17" />
            Chiqish
          </button>
        </div>
      </aside>
      <div class="admin-workspace">
        <header class="admin-topbar">
          <span>
            THEATRO
            <span>
              /
              {{
                activeSection?.label ||
                (active === 'hero' ? 'Bosh sahifa' : 'Umumiy ko‘rinish')
              }}
            </span>
          </span>
          <span class="admin-account">
            <span>A</span>
            Administrator
          </span>
        </header>
        <div
          id="admin-content"
          class="admin-main"
        >
          <div class="admin-page-heading">
            <div>
              <span class="admin-overline">TEATR BOSHQARUVI</span>
              <h1>
                {{
                  activeSection?.label ||
                  (active === 'hero' ? 'Bosh sahifa rasmi' : 'Umumiy ko‘rinish')
                }}
              </h1>
              <p>
                {{
                  activeSection
                    ? 'Ma’lumotlarni qo‘shing, tahrirlang va saytda yangilang.'
                    : active === 'hero'
                      ? 'Saytning birinchi taassurotini yarating.'
                      : active === 'about'
                        ? 'Teatr tarixi, maqsadi va ijodiy hayoti haqida ma?lumot kiriting.'
                        : active === 'contact'
                          ? 'Manzil, telefon va ish vaqtini yangilang.'
                          : 'Teatringizning raqamli sahnasiga xush kelibsiz.'
                }}
              </p>
            </div>
            <button
              v-if="activeSection"
              class="admin-primary"
              @click="openEditor()"
            >
              <Plus :size="18" />
              Yangi qo‘shish
            </button>
          </div>
          <p
            v-if="notice"
            class="admin-success"
            role="status"
          >
            <Check :size="18" />
            {{ notice }}
          </p>
          <p
            v-if="error"
            class="admin-error"
            role="alert"
          >
            {{ error }}
          </p>
          <template v-if="active === 'dashboard'">
            <div class="admin-stats">
              <button
                v-for="(section, key) in sections"
                :key="key"
                @click="navigate(key)"
              >
                <span class="admin-stat-top">
                  {{ section.label }}
                  <component
                    :is="icons[key]"
                    :size="20"
                  />
                </span>
                <strong>{{ content[key].length }}</strong>
                <span>
                  Boshqarish
                  <ArrowUpRight :size="16" />
                </span>
              </button>
            </div>
            <section class="admin-welcome">
              <div>
                <span class="admin-overline">HAMMASI NAZORAT OSTIDA</span>
                <h2>
                  Keyingi sahnani
                  <br />
                  <em>birga tayyorlaymiz.</em>
                </h2>
                <p>
                  Repertuarni yangilang, ijodkorlarni tanishtiring va eng yorqin
                  lahzalarni ulashing.
                </p>
                <button
                  class="admin-primary"
                  @click="navigate('performances')"
                >
                  Repertuarni boshqarish
                  <ArrowUpRight :size="18" />
                </button>
              </div>
              <Drama
                :size="210"
                :stroke-width="0.6"
                aria-hidden="true"
              />
            </section>
            <div class="admin-summary">
              <span>
                <span class="admin-status-dot"></span>
                Saytda {{ total }} ta yozuv mavjud
              </span>
              <RouterLink
                to="/"
                target="_blank"
                rel="noopener"
              >
                Saytni ochish
                <ArrowUpRight :size="16" />
              </RouterLink>
            </div>
          </template>
          <section
            v-else-if="activeSection"
            class="admin-list-panel"
          >
            <div class="admin-list-toolbar">
              <h2>
                Barcha {{ activeSection.label.toLocaleLowerCase() }}
                <small>{{ content[active].length }}</small>
              </h2>
              <label class="admin-search">
                <Search :size="17" />
                <input
                  v-model="search"
                  type="search"
                  aria-label="Qidirish"
                  placeholder="Qidirish…"
                />
              </label>
            </div>
            <div class="admin-table-scroll">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Nomi</th>
                    <th>
                      {{
                        active === 'performances'
                          ? 'Sana va vaqt'
                          : active === 'socialLinks'
                            ? 'Havola'
                            : 'Turkum / lavozim'
                      }}
                    </th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in items"
                    :key="item.id"
                  >
                    <td>
                      <div class="admin-item-name">
                        <img
                          v-if="item.image"
                          :src="imageUrl(item.image, 180)"
                          alt=""
                        />
                        <span
                          v-else
                          class="admin-item-icon"
                        >
                          <component
                            :is="
                              active === 'socialLinks'
                                ? socialIcon(item)
                                : icons[active]
                            "
                            :size="21"
                          />
                        </span>
                        <div>
                          <strong>{{ item.name || item.title }}</strong>
                          <small>{{ item.genre || item.description }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {{
                        active === 'performances'
                          ? `${item.dateISO} · ${item.time}`
                          : item.role || item.category || item.url
                      }}
                    </td>
                    <td>
                      <div class="admin-row-actions">
                        <button
                          :aria-label="`${item.name || item.title} — tahrirlash`"
                          @click="openEditor(item)"
                        >
                          <Pencil :size="17" />
                        </button>
                        <button
                          class="admin-delete"
                          :aria-label="`${item.name || item.title} — o‘chirish`"
                          @click="requestDelete(item)"
                        >
                          <Trash2 :size="17" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!items.length">
                    <td
                      colspan="3"
                      class="admin-empty"
                    >
                      {{
                        search
                          ? 'Qidiruvga mos ma’lumot topilmadi.'
                          : 'Hozircha ma’lumot yo‘q. Yangi yozuv qo‘shing.'
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="admin-table-footer">
              {{ items.length }} ta yozuv ko‘rsatilmoqda
            </div>
          </section>
          <AdminContactEditor
            v-else-if="active === 'contact'"
            :contact="contact"
            :saved-contact="content.contact"
            :busy="busy"
            @update="(key, value) => (contact[key] = value)"
            @save="saveContact"
            @reset="contact = { ...content.contact }"
          />
          <AdminAboutEditor
            v-else-if="active === 'about'"
            :about="about"
            :saved-about="content.about"
            :busy="busy"
            @update="(key, value) => (about[key] = value)"
            @upload="(file) => uploadHero(file, 'image', 'about')"
            @save="saveAbout"
            @reset="about = { ...content.about }"
          />
          <AdminHeroEditor
            v-else-if="active === 'hero'"
            :hero="hero"
            :saved-hero="content.heroMedia"
            :files="heroFiles"
            :busy="busy"
            @upload="uploadHero"
            @save="saveHero"
            @reset="resetHero"
            @remove-animation="hero.animatedSrc = ''"
          />
        </div>
        <footer class="admin-footer">
          THEATRO
          <span>Ijod uchun yaratilgan boshqaruv.</span>
        </footer>
      </div>
    </div>
    <dialog
      ref="editor"
      class="admin-dialog"
      @cancel="busy && $event.preventDefault()"
    >
      <form
        v-if="activeSection"
        @submit.prevent="saveItem"
      >
        <div class="admin-dialog-heading">
          <div>
            <span class="admin-overline">{{ activeSection.label }}</span>
            <h2>
              {{ editingId === null ? 'Yangi yozuv' : 'Yozuvni tahrirlash' }}
            </h2>
          </div>
          <button
            type="button"
            class="admin-icon-button"
            aria-label="Yopish"
            :disabled="busy"
            @click="editor.close()"
          >
            <X />
          </button>
        </div>
        <div class="admin-form-fields">
          <label
            v-for="[key, label, type] in activeSection.fields"
            :key="key"
            class="admin-field"
          >
            {{ label }}
            <span
              v-if="type === 'social-icon'"
              class="admin-social-icon-picker"
            >
              <component
                :is="socialIcon(draft)"
                :size="24"
                aria-hidden="true"
              />
              <select
                v-model="draft[key]"
                required
              >
                <option
                  v-for="[value, name] in socialIconOptions"
                  :key="value"
                  :value="value"
                >
                  {{ name }}
                </option>
              </select>
            </span>
            <span
              v-else-if="type === 'image-upload'"
              class="admin-record-upload"
            >
              <img
                v-if="draft[key]"
                :key="draft[key]"
                :src="imageUrl(draft[key], 600)"
                :alt="draft.name || label"
              />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                :disabled="busy"
                :required="!draft[key]"
                @change="uploadRecordImage($event, key)"
              />
              <small>
                PNG, JPG, WebP yoki GIF tanlang. Eng katta hajm: 10 MB.
              </small>
              <small
                v-if="busy"
                role="status"
              >
                Bajarilmoqda?
              </small>
            </span>
            <textarea
              v-else-if="type === 'textarea'"
              v-model="draft[key]"
              required
              maxlength="5000"
              rows="4"
            ></textarea>
            <input
              v-else
              v-model="draft[key]"
              :type="type || 'text'"
              :placeholder="
                type === 'url' ? 'https://t.me/teatr_nomi' : undefined
              "
              required
              maxlength="5000"
            />
          </label>
        </div>
        <p
          v-if="error"
          class="admin-error"
          role="alert"
        >
          {{ error }}
        </p>
        <div class="admin-dialog-actions">
          <button
            type="button"
            class="admin-secondary"
            :disabled="busy"
            @click="editor.close()"
          >
            Bekor qilish
          </button>
          <button
            class="admin-primary"
            :disabled="busy"
          >
            <Save :size="17" />
            {{ busy ? 'Saqlanmoqda…' : 'Saqlash' }}
          </button>
        </div>
      </form>
    </dialog>
    <dialog
      ref="deleteDialog"
      class="admin-dialog admin-confirm"
      aria-labelledby="delete-title"
      @cancel="busy && $event.preventDefault()"
      @close="deleting = null"
    >
      <section v-if="deleting">
        <Trash2 :size="30" />
        <h2 id="delete-title">Yozuvni o‘chirish</h2>
        <p>
          «{{ deleting.name || deleting.title }}» saytdan o‘chiriladi. Davom
          etasizmi?
        </p>
        <p
          v-if="error"
          class="admin-error"
          role="alert"
        >
          {{ error }}
        </p>
        <div class="admin-dialog-actions">
          <button
            class="admin-secondary"
            :disabled="busy"
            @click="deleteDialog.close()"
          >
            Bekor qilish
          </button>
          <button
            class="admin-danger"
            :disabled="busy"
            @click="deleteItem"
          >
            {{ busy ? 'O‘chirilmoqda…' : 'O‘chirish' }}
          </button>
        </div>
      </section>
    </dialog>
  </div>
</template>
