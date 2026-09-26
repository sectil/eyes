// Vercel Function: Nef Göz Koçu köprüsü (telefon → bu fonksiyon → OpenRouter).
// API anahtarı yalnızca burada, ortam değişkeninde: EYETRAIL_OPENROUTER_KEY (Sensitive).
// Model: EYETRAIL_COACH_MODEL (yoksa DEFAULT_MODEL). Kamera verisi/kimlik gelmez; yalnızca özet sayılar.
// Biçim: Vercel "fetch Web Standard" (vercel.com/docs/functions/functions-api-reference).
import { SYSTEM_PROMPT, buildUserPrompt, sanitizeSignals, parseCoachReply, MAX_SIGNAL_BYTES } from '../src/lib/coachCore.js'

// VARSAYIM: ucuz ve Türkçesi iyi bir model; kurulum betiği (scripts/coach-setup.sh) OpenRouter
// model listesinde var olduğunu doğrulayıp EYETRAIL_COACH_MODEL'e yazar.
const DEFAULT_MODEL = 'google/gemini-3.1-flash-lite'
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const TIMEOUT_MS = 12000

// iOS uygulaması capacitor://localhost kökenden, web sürümü kendi alanından çağırır.
const ALLOWED_ORIGINS = ['capacitor://localhost', 'ionic://localhost', 'https://eyetrail.vercel.app', 'http://localhost', 'http://localhost:5173', 'http://localhost:4173']

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://eyetrail.vercel.app'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

const json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } })

export default {
  async fetch(request) {
    const origin = request.headers.get('origin') ?? ''
    const h = cors(origin)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: h })
    if (request.method === 'GET') return json({ ok: true, service: 'eyetrail-coach', configured: Boolean(process.env.EYETRAIL_OPENROUTER_KEY) }, 200, h)
    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405, h)

    const key = process.env.EYETRAIL_OPENROUTER_KEY
    if (!key) return json({ ok: false, error: 'not-configured' }, 503, h)

    const text = await request.text()
    if (text.length > MAX_SIGNAL_BYTES) return json({ ok: false, error: 'too-large' }, 413, h)
    let body
    try {
      body = JSON.parse(text)
    } catch {
      return json({ ok: false, error: 'bad-json' }, 400, h)
    }
    if (body?.kind !== 'today') return json({ ok: false, error: 'kind' }, 400, h)
    const signals = sanitizeSignals(body.signals)
    const model = process.env.EYETRAIL_COACH_MODEL || DEFAULT_MODEL

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    try {
      const r = await fetch(OPENROUTER_URL, {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://eyetrail.vercel.app',
          'X-Title': 'Nefona',
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          max_tokens: 220,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(signals) },
          ],
        }),
      })
      if (!r.ok) return json({ ok: false, error: `upstream-${r.status}` }, 502, h)
      const data = await r.json()
      const content = data?.choices?.[0]?.message?.content
      const reply = parseCoachReply(typeof content === 'string' ? content : '')
      if (!reply) return json({ ok: false, error: 'unsafe-or-invalid' }, 422, h)
      return json({ ok: true, ...reply, model }, 200, h)
    } catch (e) {
      return json({ ok: false, error: e?.name === 'AbortError' ? 'timeout' : 'network' }, 504, h)
    } finally {
      clearTimeout(timer)
    }
  },
}
