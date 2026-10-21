<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { usePerformancesStore } from '../stores/performances'
import RepertoireRow from '../components/RepertoireRow.vue'
import '../assets/repertoire.css'
const store = usePerformancesStore()
const route = useRoute()
const monthGroups = computed(() => {
  const months = [
    'Yanvar',
    'Fevral',
    'Mart',
    'Aprel',
    'May',
    'Iyun',
    'Iyul',
    'Avgust',
    'Sentabr',
    'Oktabr',
    'Noyabr',
    'Dekabr',
  ]
  const groups = new Map()
  for (const performance of [...store.performances].sort((a, b) =>
    `${a.dateISO} ${a.time}`.localeCompare(`${b.dateISO} ${b.time}`),
  )) {
    const key = performance.dateISO.slice(0, 7)
    if (!groups.has(key))
      groups.set(key, {
        key,
        month: months[Number(key.slice(5)) - 1],
        year: key.slice(0, 4),
        items: [],
      })
    groups.get(key).items.push(performance)
  }
  return [...groups.values()]
})
</script>

<template>
  <section class="repertoire-page">
    <div class="container">
      <header class="repertoire-heading">
        <div>
          <p class="repertoire-kicker">THEATRO / 2026–2027 MAVSUMI</p>
          <h1>
            Repertuar
            <span>.</span>
          </h1>
        </div>
        <p class="repertoire-intro">
          Bir oqshom. Bir hikoya.
          <br />
          Unutilmas taassurotlar.
        </p>
      </header>
      <template
        v-for="group in monthGroups"
        :key="group.key"
      >
        <div class="repertoire-month">
          <h2>
            {{ group.month }}
            <span>{{ group.year }}</span>
          </h2>
          <span>{{ group.items.length }} ta spektakl</span>
        </div>
        <ul
          class="repertoire-list"
          :aria-label="`${group.month} ${group.year} spektakllari`"
        >
          <RepertoireRow
            v-for="performance in group.items"
            :key="performance.id"
            :performance="performance"
            :expanded="route.query.show === performance.id"
          />
        </ul>
      </template>
      <p
        v-if="!monthGroups.length"
        class="notice"
      >
        Hozircha repertuar mavjud emas. Yangi spektakllar tez orada e’lon
        qilinadi.
      </p>
      <aside class="repertoire-notice">
        <span class="repertoire-notice-mark">i</span>
        <div>
          <h2>Tomoshabinlar uchun ma’lumot</h2>
          <p>
            Ushbu repertuar demo ma’lumotlardan iborat. Sanalar va spektakllar
            namuna sifatida berilgan. Chipta narxlari va savdo imkoniyati
            keyinchalik qo‘shiladi.
          </p>
        </div>
      </aside>
    </div>
  </section>
</template>
