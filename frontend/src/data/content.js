import { reactive } from 'vue'
import defaults from '../../shared/default-content.json'
import { sections, validateContent } from '../../shared/content.mjs'

export const content = reactive(structuredClone(defaults))
export function applyContent(value) {
  validateContent(value)
  for (const key of Object.keys(sections))
    content[key].splice(0, content[key].length, ...value[key])
  Object.assign(content.heroMedia, value.heroMedia)
  Object.assign(content.about, value.about)
  Object.assign(content.contact, value.contact)
}
export async function loadContent() {
  try {
    const response = await fetch('/api/content', {
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return
    applyContent(validateContent(await response.json()))
  } catch {
    // Server mavjud bo‘lmaganda namuna ma’lumotlarini ko‘rsatamiz.
  }
}
