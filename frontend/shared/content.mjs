export const defaultContact = {
  address: 'Toshkent, O‘zbekiston',
  phone: '',
  email: '',
  hours: 'Tez orada e’lon qilinadi.',
  mapUrl: '',
  note: '',
}

export const contactFields = [
  ['address', 'Teatr manzili', 'textarea', true],
  ['phone', 'Telefon raqami', 'tel', false],
  ['email', 'Elektron pochta', 'email', false],
  ['hours', 'Kassa ish vaqti', 'textarea', true],
  ['mapUrl', 'Xarita havolasi (ixtiyoriy)', 'url', false],
  ['note', 'Qo‘shimcha ma’lumot (ixtiyoriy)', 'textarea', false],
]

export const defaultAbout = {
  eyebrow: 'BIZNING HIKOYAMIZ',
  title: 'San’at bilan',
  accent: 'yashaymiz.',
  subtitle: 'Har bir sahna —\nyangi bir olam.',
  body: 'Teatrimiz tomoshabinlarga yuksak sahna madaniyatini taqdim etishga intiladi. Har bir spektakl — yangi hikoya va yangi taassurot.\n\nTHEATRO san’atni sevuvchi insonlarni birlashtiradigan maskan sifatida yaratilmoqda. Ijodiy jamoa, sahna hikoyalari va teatr hayotidagi yorqin lahzalar bilan shu yerda tanishing.',
  image:
    'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1000&q=85',
  imageAlt: 'Teatr zali',
  note: 'Ushbu sahifadagi matn va tasvirlar namuna sifatida berilgan.',
}

export const socialIconOptions = [
  ['auto', 'Havolaga qarab avtomatik'],
  ['instagram', 'Instagram'],
  ['telegram', 'Telegram'],
  ['youtube', 'YouTube'],
  ['facebook', 'Facebook'],
  ['linkedin', 'LinkedIn'],
  ['twitter', 'X / Twitter'],
  ['globe', 'Umumiy havola'],
]

export const sections = {
  performances: {
    label: 'Spektakllar',
    fields: [
      ['name', 'Nomi'],
      ['genre', 'Janri'],
      ['dateISO', 'Sana', 'date'],
      ['time', 'Boshlanish vaqti', 'time'],
      ['age', 'Yosh chegarasi'],
      ['image', 'Spektakl rasmi', 'image-upload'],
      ['description', 'Tavsif', 'textarea'],
    ],
  },
  actors: {
    label: 'Aktyorlar',
    fields: [
      ['name', 'Ism-familiya'],
      ['role', 'Lavozimi'],
      ['initials', 'Qisqa belgi'],
      ['description', 'Ijodiy faoliyati', 'textarea'],
    ],
  },
  achievements: {
    label: 'Yutuqlar',
    fields: [
      ['title', 'Sarlavha'],
      ['category', 'Turkum'],
      ['description', 'Tavsif', 'textarea'],
    ],
  },
  gallery: {
    label: 'Galereya',
    fields: [
      ['title', 'Sarlavha'],
      ['category', 'Turkum'],
      ['image', 'Rasm havolasi yoki Unsplash ID'],
    ],
  },
  socialLinks: {
    label: 'Ijtimoiy tarmoqlar',
    fields: [
      ['name', 'Tarmoq nomi'],
      ['url', 'Sahifa havolasi', 'url'],
      ['icon', 'Ikonka', 'social-icon'],
    ],
  },
}

export function imageUrl(value, width = 900) {
  if (value.startsWith('/') || value.startsWith('https://')) return value
  return `https://images.unsplash.com/${value}?auto=format&fit=crop&w=${width}&q=85`
}

export function validateContent(content) {
  const fail = (message) => {
    throw new Error(message)
  }
  const isText = (value, max = 5000) =>
    typeof value === 'string' && value.trim().length > 0 && value.length <= max
  const validImage = (value) =>
    typeof value === 'string' &&
    value.length <= 2000 &&
    (/^photo-[\w-]+$/.test(value) ||
      /^\/(?!\/)[^\s\\]*$/.test(value) ||
      /^https:\/\/[^\s]+$/.test(value))
  if (!content || typeof content !== 'object' || Array.isArray(content))
    fail('Ma’lumot shakli noto‘g‘ri.')
  // Oldin saqlangan ma’lumotlarni yangi bo‘limga moslashtiramiz.
  if (content.socialLinks === undefined) content.socialLinks = []
  if (content.about === undefined) content.about = { ...defaultAbout }
  if (content.contact === undefined) content.contact = { ...defaultContact }
  for (const [key, section] of Object.entries(sections)) {
    if (!Array.isArray(content[key]) || content[key].length > 500)
      fail(`${section.label}: ro‘yxat noto‘g‘ri.`)
    const ids = new Set()
    for (const item of content[key]) {
      if (
        !item ||
        !['string', 'number'].includes(typeof item.id) ||
        !/^[a-zA-Z0-9_-]{1,128}$/.test(String(item.id)) ||
        ids.has(String(item.id))
      )
        fail(`${section.label}: ID takrorlangan yoki noto‘g‘ri.`)
      ids.add(String(item.id))
      if (key === 'socialLinks' && item.icon === undefined) item.icon = 'auto'
      for (const [field, label] of section.fields) {
        if (!isText(item[field]))
          fail(
            `${section.label}: ${label} to‘ldirilishi kerak (5000 belgigacha).`,
          )
      }
      if ('image' in item && !validImage(item.image))
        fail(
          'Rasm uchun HTTPS havola, /media/ yo‘li yoki Unsplash ID kiriting.',
        )
      if (key === 'socialLinks') {
        if (!socialIconOptions.some(([key]) => key === item.icon))
          fail('Ijtimoiy tarmoq ikonkasini ro‘yxatdan tanlang.')
        let url
        try {
          url = new URL(item.url)
        } catch {
          fail('Ijtimoiy tarmoq uchun to‘liq HTTPS havola kiriting.')
        }
        if (
          url.protocol !== 'https:' ||
          !url.hostname ||
          url.username ||
          url.password ||
          /[\s\\]/.test(item.url)
        )
          fail('Ijtimoiy tarmoq uchun to‘liq HTTPS havola kiriting.')
      }
      if (key === 'performances') {
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(item.dateISO) ||
          Number.isNaN(Date.parse(item.dateISO)) ||
          new Date(item.dateISO).toISOString().slice(0, 10) !== item.dateISO
        )
          fail('Spektakl sanasi noto‘g‘ri.')
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time))
          fail('Vaqt noto‘g‘ri.')
      }
    }
  }
  if (
    !content.heroMedia ||
    !validImage(content.heroMedia.poster) ||
    !(
      content.heroMedia.animatedSrc === '' ||
      validImage(content.heroMedia.animatedSrc)
    )
  )
    fail('Bosh sahifa rasmlari noto‘g‘ri.')
  if (
    !content.about ||
    typeof content.about !== 'object' ||
    Array.isArray(content.about)
  )
    fail('Teatr haqida ma’lumot noto‘g‘ri.')
  for (const field of ['eyebrow', 'title', 'subtitle', 'body', 'imageAlt'])
    if (!isText(content.about[field], field === 'body' ? 20000 : 500))
      fail('Teatr haqida: majburiy matnlarni to‘ldiring.')
  for (const field of ['accent', 'note'])
    if (
      typeof content.about[field] !== 'string' ||
      content.about[field].length > 5000
    )
      fail('Teatr haqida: izoh yoki sarlavha noto‘g‘ri.')
  if (!validImage(content.about.image)) fail('Teatr haqida: rasm noto‘g‘ri.')
  if (
    !content.contact ||
    typeof content.contact !== 'object' ||
    Array.isArray(content.contact)
  )
    fail('Aloqa ma’lumotlari noto‘g‘ri.')
  for (const [key, label, , required] of contactFields) {
    const value = content.contact[key]
    if (
      typeof value !== 'string' ||
      value.length > 2000 ||
      (required && !value.trim())
    )
      fail(`Aloqa: ${label} noto‘g‘ri yoki to‘ldirilmagan.`)
  }
  const { phone, email, mapUrl } = content.contact
  if (
    phone &&
    (!/^\+?[\d ()-]+$/.test(phone) ||
      !/^[0-9]{7,15}$/.test(phone.replace(/\D/g, '')))
  )
    fail('Telefon raqamini to‘g‘ri kiriting, masalan: +998 90 123 45 67.')
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fail('Elektron pochta manzili noto‘g‘ri.')
  if (mapUrl) {
    let url
    try {
      url = new URL(mapUrl)
    } catch {
      fail('Xarita uchun to‘liq HTTPS havola kiriting.')
    }
    if (
      url.protocol !== 'https:' ||
      !url.hostname ||
      url.username ||
      url.password ||
      /[\s\\]/.test(mapUrl)
    )
      fail('Xarita uchun to‘liq HTTPS havola kiriting.')
  }
  return content
}

export function performanceDate(date) {
  const months = [
    'yanvar',
    'fevral',
    'mart',
    'aprel',
    'may',
    'iyun',
    'iyul',
    'avgust',
    'sentabr',
    'oktabr',
    'noyabr',
    'dekabr',
  ]
  const [, month, day] = date.split('-')
  return `${Number(day)} ${months[Number(month) - 1]}`
}
