import http from 'node:http'
import { readFile, writeFile, mkdir, rename, stat } from 'node:fs/promises'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { validateContent, performanceDate } from '../shared/content.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const dev = process.argv.includes('--dev')
const password = process.env.ADMIN_PASSWORD
if (
  !password ||
  password.length < 12 ||
  password === 'replace-with-a-unique-long-password'
) {
  console.error(
    'ADMIN_PASSWORD kamida 12 belgidan iborat bo‘lishi kerak. .env.example asosida .env yarating.',
  )
  process.exit(1)
}
const passwordHash = scryptSync(password, 'theatro-admin', 64)
const port = Number(process.env.PORT || 3002)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT 1 dan 65535 gacha bo‘lgan butun son bo‘lishi kerak.')
  process.exit(1)
}
if (dev && port === 5174) {
  console.error(
    'PORT=5174 Vite uchun band. .env faylida API uchun PORT=3002 yozing.',
  )
  process.exit(1)
}
const host = process.env.HOST || '127.0.0.1'
const dataDir = path.resolve(root, process.env.DATA_DIR || 'server/data')
await mkdir(dataDir, { recursive: true })
const dataPath = path.join(dataDir, 'content.json')
const uploadsDir = path.join(dataDir, 'uploads')
const maxImageSize = 10 * 1024 * 1024
const imageTypes = {
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
}
function imageExtension(buffer) {
  if (
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return 'png'
  if (
    buffer.length > 3 &&
    buffer[0] === 255 &&
    buffer[1] === 216 &&
    buffer[2] === 255
  )
    return 'jpg'
  if (['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString()))
    return 'gif'
  if (
    buffer.subarray(0, 4).toString() === 'RIFF' &&
    buffer.subarray(8, 12).toString() === 'WEBP'
  )
    return 'webp'
  return null
}
let content
try {
  content = validateContent(JSON.parse(await readFile(dataPath, 'utf8')))
} catch (error) {
  if (error.code !== 'ENOENT') throw error
  content = JSON.parse(
    await readFile(path.join(root, 'shared/default-content.json'), 'utf8'),
  )
}
const sessions = new Map()
const attempts = new Map()
const sessionDuration = 8 * 60 * 60 * 1000
const secureCookie = process.env.COOKIE_SECURE === 'true'
let saving = Promise.resolve()
const send = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(data))
}
const tokenOf = (req) =>
  /(?:^|;\s*)theatro_session=([a-f0-9]+)/.exec(req.headers.cookie || '')?.[1]
const authenticated = (req) => (sessions.get(tokenOf(req)) || 0) > Date.now()
const cookie = (token, age) =>
  `theatro_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secureCookie ? '; Secure' : ''}`
async function body(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > 2_000_000) throw new Error('So‘rov hajmi juda katta.')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString())
}
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  try {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname.startsWith('/api/')) {
      if (!['GET', 'HEAD'].includes(req.method)) {
        const allowed = process.env.APP_ORIGIN
          ? [process.env.APP_ORIGIN]
          : [
              `http://localhost:${dev ? 5174 : port}`,
              `http://127.0.0.1:${dev ? 5174 : port}`,
            ]
        if (!allowed.includes(req.headers.origin))
          return send(res, 403, { error: 'So‘rov manbasi ruxsat etilmagan.' })
        if (
          url.pathname !== '/api/uploads' &&
          !req.headers['content-type']?.startsWith('application/json')
        )
          return send(res, 415, { error: 'JSON yuboring.' })
      }
      if (
        url.pathname.startsWith('/api/uploads/') &&
        ['GET', 'HEAD'].includes(req.method)
      ) {
        const filename = url.pathname.slice('/api/uploads/'.length)
        if (!/^[a-f0-9]{32}\.(png|jpg|gif|webp)$/.test(filename))
          return send(res, 404, { error: 'Rasm topilmadi.' })
        let buffer
        try {
          buffer = await readFile(path.join(uploadsDir, filename))
        } catch (error) {
          if (error.code === 'ENOENT')
            return send(res, 404, { error: 'Rasm topilmadi.' })
          throw error
        }
        res.writeHead(200, {
          'Content-Type': imageTypes[path.extname(filename).slice(1)],
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': buffer.length,
        })
        return res.end(req.method === 'HEAD' ? undefined : buffer)
      }
      if (url.pathname === '/api/content' && req.method === 'GET')
        return send(res, 200, content)
      if (url.pathname === '/api/session' && req.method === 'GET')
        return send(res, 200, { authenticated: authenticated(req) })
      if (url.pathname === '/api/login' && req.method === 'POST') {
        const ip = req.socket.remoteAddress
        const attempt = attempts.get(ip)
        if (attempt && attempt.expires > Date.now() && attempt.count >= 5)
          return send(res, 429, {
            error: 'Urinishlar ko‘p. 15 daqiqadan keyin qayta urinib ko‘ring.',
          })
        const input = await body(req)
        if (
          typeof input.password !== 'string' ||
          input.password.length > 1024 ||
          !timingSafeEqual(
            passwordHash,
            scryptSync(input.password, 'theatro-admin', 64),
          )
        ) {
          const previous =
            attempt?.expires > Date.now()
              ? attempt
              : { count: 0, expires: Date.now() + 900000 }
          attempts.set(ip, { ...previous, count: previous.count + 1 })
          return send(res, 401, { error: 'Parol noto‘g‘ri.' })
        }
        attempts.delete(ip)
        sessions.delete(tokenOf(req))
        const token = randomBytes(32).toString('hex')
        sessions.set(token, Date.now() + sessionDuration)
        res.setHeader('Set-Cookie', cookie(token, sessionDuration / 1000))
        return send(res, 200, { authenticated: true })
      }
      if (!authenticated(req))
        return send(res, 401, { error: 'Admin panelga qayta kiring.' })
      if (url.pathname === '/api/uploads' && req.method === 'POST') {
        if (!Object.values(imageTypes).includes(req.headers['content-type']))
          return send(res, 415, {
            error: 'PNG, JPG, WebP yoki GIF rasm tanlang.',
          })
        if (Number(req.headers['content-length']) > maxImageSize)
          return send(res, 413, {
            error: 'Rasm hajmi 10 MB dan oshmasligi kerak.',
          })
        let size = 0
        const chunks = []
        for await (const chunk of req) {
          size += chunk.length
          if (size > maxImageSize) {
            send(res, 413, { error: 'Rasm hajmi 10 MB dan oshmasligi kerak.' })
            return
          }
          chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)
        const extension = imageExtension(buffer)
        if (!extension || imageTypes[extension] !== req.headers['content-type'])
          return send(res, 415, {
            error: 'Fayl haqiqiy PNG, JPG, WebP yoki GIF rasm bo‘lishi kerak.',
          })
        await mkdir(uploadsDir, { recursive: true })
        const filename = `${randomBytes(16).toString('hex')}.${extension}`
        await writeFile(path.join(uploadsDir, filename), buffer, { flag: 'wx' })
        return send(res, 201, { url: `/api/uploads/${filename}` })
      }
      if (url.pathname === '/api/logout' && req.method === 'POST') {
        sessions.delete(tokenOf(req))
        res.setHeader('Set-Cookie', cookie('', 0))
        return send(res, 200, { ok: true })
      }
      if (url.pathname === '/api/content' && req.method === 'PUT') {
        const next = validateContent(await body(req))
        next.performances.forEach((item) => {
          item.date = performanceDate(item.dateISO)
        })
        const write = saving.then(async () => {
          await writeFile(`${dataPath}.tmp`, JSON.stringify(next, null, 2), {
            mode: 0o600,
          })
          await rename(`${dataPath}.tmp`, dataPath)
          content = next
        })
        saving = write.catch(() => {})
        await write
        return send(res, 200, content)
      }
      return send(res, 404, { error: 'API topilmadi.' })
    }
    if (!['GET', 'HEAD'].includes(req.method))
      return send(res, 405, { error: 'Usul ruxsat etilmagan.' })
    const dist = path.join(root, 'dist')
    let file = path.resolve(dist, `.${decodeURIComponent(url.pathname)}`)
    if (!file.startsWith(dist + path.sep) && file !== dist)
      return send(res, 403, { error: 'Ruxsat yo‘q.' })
    try {
      if (!(await stat(file)).isFile()) file = path.join(dist, 'index.html')
    } catch {
      file = path.extname(file) ? null : path.join(dist, 'index.html')
    }
    if (!file) return send(res, 404, { error: 'Fayl topilmadi.' })
    const buffer = await readFile(file)
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
    })
    res.end(req.method === 'HEAD' ? undefined : buffer)
  } catch (error) {
    console.error(error.message)
    send(res, error.code ? 500 : 400, {
      error: error.code
        ? 'Server xatosi. Qayta urinib ko‘ring.'
        : error.message,
    })
  }
})
const cleanup = setInterval(() => {
  for (const [key, expires] of sessions)
    if (expires < Date.now()) sessions.delete(key)
  for (const [key, value] of attempts)
    if (value.expires < Date.now()) attempts.delete(key)
}, 60000)
cleanup.unref()
server.on('error', (error) => {
  console.error(
    error.code === 'EADDRINUSE'
      ? `${port} port band. Ishlayotgan serverni ishlating yoki .env ichida PORT ni o‘zgartiring.`
      : error.message,
  )
  process.exit(1)
})
server.listen(port, host, () => {
  console.log(`THEATRO server: http://${host}:${port}`)
  if (!dev) return
  const vite = spawn(
    process.execPath,
    [
      path.join(root, 'node_modules/vite/bin/vite.js'),
      '--host',
      '127.0.0.1',
      '--port',
      '5174',
      '--strictPort',
      '--configLoader',
      'runner',
    ],
    { cwd: root, stdio: 'inherit' },
  )
  vite.on('exit', () => server.close(() => process.exit()))
  process.on('SIGINT', () => {
    vite.kill()
    server.close(() => process.exit())
  })
  process.on('SIGTERM', () => {
    vite.kill()
    server.close(() => process.exit())
  })
})
