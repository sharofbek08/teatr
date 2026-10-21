import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { validateContent } from '../shared/content.mjs'
import { contactMap } from '../shared/map.mjs'

test(
  'Admin API: authorization, validation, CRUD and persistent storage',
  { timeout: 30000 },
  async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'theatro-admin-test-'))
    const port = 23000 + Math.floor(Math.random() * 10000)
    const origin = `http://127.0.0.1:${port}`
    const password = randomBytes(24).toString('hex')
    let child
    let cookie = ''
    async function start() {
      child = spawn(process.execPath, ['server/index.mjs'], {
        cwd: new URL('../', import.meta.url),
        env: {
          ...process.env,
          ADMIN_PASSWORD: password,
          PORT: String(port),
          HOST: '127.0.0.1',
          DATA_DIR: directory,
          APP_ORIGIN: origin,
        },
        stdio: 'pipe',
      })
      for (let i = 0; i < 100; i++) {
        if (child.exitCode !== null)
          throw new Error('Test server stopped unexpectedly')
        try {
          if ((await fetch(`${origin}/api/session`)).ok) return
        } catch {}
        await delay(50)
      }
      throw new Error('Test server did not start')
    }
    async function stop() {
      if (!child || child.exitCode !== null) return
      const exited = new Promise((resolve) => child.once('exit', resolve))
      child.kill()
      await exited
    }
    const request = (route, method = 'GET', body, extra = {}) =>
      fetch(`${origin}/api/${route}`, {
        method,
        headers: {
          Origin: origin,
          'Content-Type': 'application/json',
          Cookie: cookie,
          ...extra,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aA1cAAAAASUVORK5CYII=',
      'base64',
    )
    const upload = (data = png, type = 'image/png', source = origin) =>
      fetch(`${origin}/api/uploads`, {
        method: 'POST',
        headers: { Origin: source, 'Content-Type': type, Cookie: cookie },
        body: data,
      })
    try {
      const legacy = JSON.parse(
        await readFile(
          new URL('../shared/default-content.json', import.meta.url),
          'utf8',
        ),
      )
      delete legacy.socialLinks
      delete legacy.about
      delete legacy.contact
      await writeFile(
        path.join(directory, 'content.json'),
        JSON.stringify(legacy),
      )
      await start()
      const initial = await (await request('content')).json()
      assert.deepEqual(initial.socialLinks, [])
      assert.equal(initial.about.title, 'San’at bilan')
      assert.equal(initial.contact.address, 'Toshkent, O‘zbekiston')
      assert.deepEqual(initial.performances, legacy.performances)
      assert.equal(
        (await request('session').then((r) => r.json())).authenticated,
        false,
      )
      assert.equal((await request('content', 'PUT', initial)).status, 401)
      assert.equal((await upload()).status, 401)
      assert.equal(
        (await request('login', 'POST', { password: 'wrong' })).status,
        401,
      )
      assert.equal(
        (
          await request(
            'login',
            'POST',
            { password },
            { Origin: 'https://untrusted.example' },
          )
        ).status,
        403,
      )
      const login = await request('login', 'POST', { password })
      assert.equal(login.status, 200)
      assert.match(login.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/)
      cookie = login.headers.get('set-cookie').split(';')[0]
      assert.equal(
        (await request('session').then((r) => r.json())).authenticated,
        true,
      )
      assert.equal(
        (await upload(png, 'image/png', 'https://untrusted.example')).status,
        403,
      )
      assert.equal(
        (await upload(Buffer.from('<svg></svg>'), 'image/svg+xml')).status,
        415,
      )
      assert.equal((await upload(Buffer.from('not an image'))).status, 415)
      assert.equal(
        (await upload(Buffer.alloc(10 * 1024 * 1024 + 1))).status,
        413,
      )
      const uploaded = await upload()
      assert.equal(uploaded.status, 201)
      const uploadedUrl = (await uploaded.json()).url
      assert.match(uploadedUrl, /^\/api\/uploads\/[a-f0-9]{32}\.png$/)
      const publicImage = await fetch(`${origin}${uploadedUrl}`)
      assert.equal(publicImage.headers.get('content-type'), 'image/png')
      assert.deepEqual(Buffer.from(await publicImage.arrayBuffer()), png)

      const invalid = structuredClone(initial)
      invalid.performances[0].dateISO = '2026-02-30'
      assert.equal((await request('content', 'PUT', invalid)).status, 400)
      invalid.performances[0].dateISO = '2026-02-28'
      invalid.gallery[0].image = 'javascript:alert(1)'
      assert.equal((await request('content', 'PUT', invalid)).status, 400)
      for (const url of [
        'javascript:alert(1)',
        'http://t.me/teatr',
        '/relative',
        'https://user:password@t.me/teatr',
        'https://',
      ]) {
        const unsafe = structuredClone(initial)
        unsafe.socialLinks.push({ id: 'unsafe', name: 'Telegram', url })
        assert.equal((await request('content', 'PUT', unsafe)).status, 400)
      }

      const updated = structuredClone(initial)
      for (const key of ['performances', 'actors', 'achievements', 'gallery']) {
        const item = { ...updated[key][0], id: `test-${key}` }
        if (item.name) item.name = 'Sinov yozuvi'
        if (item.title) item.title = 'Sinov yozuvi'
        updated[key].push(item)
      }
      updated.performances.at(-1).dateISO = '2027-01-15'
      updated.heroMedia.poster = uploadedUrl
      updated.about.title = 'Bizning teatr'
      updated.about.body =
        'Teatr tarixi haqida yangi ma’lumot.\n\nIjodiy jamoamiz haqida.'
      updated.about.image = uploadedUrl
      updated.contact = {
        address: 'Toshkent, Teatr ko‘chasi, 10',
        phone: '+998 90 123 45 67',
        email: 'info@teatr.uz',
        hours: 'Dushanba–Shanba\n09:00–18:00',
        mapUrl: 'https://maps.google.com/?q=Tashkent',
        note: 'Tashrifingizni kutamiz.',
      }
      updated.socialLinks.push({
        id: 'telegram',
        name: 'Telegram',
        url: 'https://t.me/teatr_test',
        icon: 'telegram',
      })
      const saved = await request('content', 'PUT', updated)
      assert.equal(saved.status, 200)
      const data = await saved.json()
      assert.equal(data.performances.at(-1).date, '15 yanvar')
      assert.equal(data.actors.at(-1).name, 'Sinov yozuvi')
      assert.equal(data.socialLinks[0].url, 'https://t.me/teatr_test')
      assert.equal(data.socialLinks[0].icon, 'telegram')
      assert.equal(data.about.title, 'Bizning teatr')
      assert.equal(data.about.image, uploadedUrl)
      assert.deepEqual(data.contact, updated.contact)
      assert.deepEqual(
        JSON.parse(
          await readFile(path.join(directory, 'content.json'), 'utf8'),
        ),
        data,
      )

      await stop()
      await start()
      assert.deepEqual(
        Buffer.from(
          await fetch(`${origin}${uploadedUrl}`).then((r) => r.arrayBuffer()),
        ),
        png,
      )
      assert.equal(
        (await request('session').then((r) => r.json())).authenticated,
        false,
      )
      assert.deepEqual(await request('content').then((r) => r.json()), data)
      const relogin = await request('login', 'POST', { password })
      cookie = relogin.headers.get('set-cookie').split(';')[0]
      const edited = structuredClone(data)
      edited.socialLinks[0] = {
        id: 'telegram',
        name: 'Instagram',
        url: 'https://www.instagram.com/teatr_test/',
        icon: 'instagram',
      }
      assert.equal((await request('content', 'PUT', edited)).status, 200)
      assert.deepEqual(
        (await request('content').then((r) => r.json())).socialLinks,
        edited.socialLinks,
      )
      assert.equal((await request('content', 'PUT', initial)).status, 200)
      assert.deepEqual(await request('content').then((r) => r.json()), initial)
      assert.equal((await request('logout', 'POST', {})).status, 200)
      assert.equal((await request('content', 'PUT', initial)).status, 401)
      assert.equal((await fetch(`${origin}/server/index.mjs`)).status, 404)

      for (let i = 0; i < 5; i++)
        await request('login', 'POST', { password: 'incorrect' })
      assert.equal((await request('login', 'POST', { password })).status, 429)
    } finally {
      await stop()
      // Only remove the unique temporary directory created by this test.
      assert.ok(
        directory.startsWith(path.join(tmpdir(), 'theatro-admin-test-')),
      )
      await rm(directory, { recursive: true, force: true })
    }
  },
)

test('Empty collections are valid and duplicate identifiers are rejected', async () => {
  const defaults = JSON.parse(
    await readFile(
      new URL('../shared/default-content.json', import.meta.url),
      'utf8',
    ),
  )
  assert.doesNotThrow(() =>
    validateContent({
      ...defaults,
      performances: [],
      actors: [],
      achievements: [],
      gallery: [],
    }),
  )
  defaults.actors.push({ ...defaults.actors[0] })
  assert.throws(() => validateContent(defaults), /ID/)
})

test('Social icon selection is validated and existing links keep automatic icons', async () => {
  const content = JSON.parse(
    await readFile(
      new URL('../shared/default-content.json', import.meta.url),
      'utf8',
    ),
  )
  content.socialLinks = [
    { id: 'telegram', name: 'Telegram', url: 'https://t.me/teatr' },
  ]
  validateContent(content)
  assert.equal(content.socialLinks[0].icon, 'auto')
  content.socialLinks[0].icon = 'unknown-icon'
  assert.throws(() => validateContent(content), /ikonka/)
})

test('Contact details validate phone, email, map links and required fields', async () => {
  const defaults = JSON.parse(
    await readFile(
      new URL('../shared/default-content.json', import.meta.url),
      'utf8',
    ),
  )
  for (const [key, value] of [
    ['phone', 'not-a-phone'],
    ['email', 'invalid'],
    ['mapUrl', 'javascript:alert(1)'],
    ['address', ''],
    ['hours', ''],
  ]) {
    const content = structuredClone(defaults)
    content.contact[key] = value
    assert.throws(() => validateContent(content))
  }
  assert.doesNotThrow(() => validateContent(defaults))
})

test('Map embeds use the address or supported map URLs', () => {
  const contact = { address: 'Toshkent, Teatr ko‘chasi 10', mapUrl: '' }
  assert.equal(
    new URL(contactMap(contact).embed).searchParams.get('q'),
    contact.address,
  )
  const embed = 'https://www.google.com/maps/embed?pb=example'
  assert.equal(contactMap({ ...contact, mapUrl: embed }).embed, embed)
  assert.equal(
    new URL(
      contactMap({ ...contact, mapUrl: 'https://maps.google.com/?q=41.3,69.2' })
        .embed,
    ).searchParams.get('q'),
    '41.3,69.2',
  )
  assert.equal(
    new URL(
      contactMap({ ...contact, mapUrl: 'https://maps.app.goo.gl/example' })
        .embed,
    ).searchParams.get('q'),
    contact.address,
  )
  assert.equal(
    new URL(
      contactMap({ ...contact, mapUrl: 'https://untrusted.example/maps/embed' })
        .embed,
    ).hostname,
    'www.google.com',
  )
})

test('Development rejects the Vite port before starting the API', async () => {
  const child = spawn(process.execPath, ['server/index.mjs', '--dev'], {
    cwd: new URL('../', import.meta.url),
    env: {
      ...process.env,
      ADMIN_PASSWORD: randomBytes(24).toString('hex'),
      PORT: '5174',
    },
    stdio: 'pipe',
  })
  let error = ''
  child.stderr.on('data', (chunk) => {
    error += chunk.toString()
  })
  const code = await new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', resolve)
  })
  assert.equal(code, 1)
  assert.match(error, /PORT=5174/)
  assert.match(error, /PORT=3002/)
})
