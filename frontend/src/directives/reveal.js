// Har bir sahifada qayta ishlatiladigan, bir marta ishlaydigan scroll animatsiyasi.
const instances = new WeakMap()
const targets = [
  'h1',
  '.eyebrow',
  '.hero-description',
  '.hero-cta',
  '.hero-note',
  '.statement',
  '.section-top',
  '.performance-card',
  '.invitation',
  '.story-layout > img',
  '.story-layout > div',
  '.about-section-heading',
  '.about-section-intro',
  '.actor-card',
  '.achievement-card',
  '.gallery-tile',
  '.repertoire-heading',
  '.repertoire-month',
  '.repertoire-entry',
  '.repertoire-notice',
  '.repertoire-expanded',
  '.contact-grid > article',
  '.intro',
  '.notice',
  '.footer-grid > div',
  '.footer-bottom',
].join(',')

export default {
  mounted(root) {
    if (!('IntersectionObserver' in window)) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const seen = new WeakSet()
    const reveal = (element) => {
      element.classList.add('is-revealed')
      observer.unobserve(element)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target)
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' },
    )

    const scan = () => {
      const elements = [...root.querySelectorAll(targets)]
      elements.forEach((element) => {
        if (element.closest('.admin-app')) return
        if (seen.has(element)) return
        seen.add(element)
        // Bir elementning ichidagi matnlarni ikkinchi marta animatsiya qilmaymiz.
        if (element.parentElement?.closest(targets)) return
        element.classList.add('motion-target')
        const siblings = [...element.parentElement.children]
        element.style.setProperty(
          '--reveal-delay',
          `${Math.min(siblings.indexOf(element) * 65, 260)}ms`,
        )
        if (preference.matches) reveal(element)
        else observer.observe(element)
      })
    }
    const onPreferenceChange = () => {
      if (preference.matches)
        root.querySelectorAll('.motion-target').forEach(reveal)
    }
    const onFocus = (event) => {
      let element = event.target.closest('.motion-target')
      while (element && root.contains(element)) {
        reveal(element)
        element = element.parentElement?.closest('.motion-target')
      }
    }
    const mutations = new MutationObserver(scan)
    mutations.observe(root, { childList: true, subtree: true })
    preference.addEventListener('change', onPreferenceChange)
    root.addEventListener('focusin', onFocus)
    scan()
    instances.set(root, () => {
      observer.disconnect()
      mutations.disconnect()
      preference.removeEventListener('change', onPreferenceChange)
      root.removeEventListener('focusin', onFocus)
    })
  },
  beforeUnmount(root) {
    instances.get(root)?.()
    instances.delete(root)
  },
}
