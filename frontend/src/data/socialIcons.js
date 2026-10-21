import {
  Instagram,
  Send,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
  Globe,
} from 'lucide-vue-next'

const icons = {
  instagram: Instagram,
  telegram: Send,
  youtube: Youtube,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  globe: Globe,
}
const hosts = {
  'instagram.com': 'instagram',
  't.me': 'telegram',
  'telegram.me': 'telegram',
  'youtube.com': 'youtube',
  'youtu.be': 'youtube',
  'facebook.com': 'facebook',
  'linkedin.com': 'linkedin',
  'x.com': 'twitter',
  'twitter.com': 'twitter',
}

export function socialIcon(social) {
  if (social.icon && social.icon !== 'auto') return icons[social.icon] || Globe
  try {
    const hostname = new URL(social.url).hostname
      .toLowerCase()
      .replace(/^www\./, '')
    return icons[hosts[hostname]] || Globe
  } catch {
    return Globe
  }
}
