// Egzersizlerde sesli komut: Profilim → Seslendirme'de seçilen ElevenLabs sesi (lib/voicePack.js); o seste dosya yoksa
// telefonun kendi sesi aynı cümleyi okur. Ses kapalıysa (prefs.sound) yalnız titreşim kalır.
// cuePhrase, lib/cue.js cue() ile aynı titreşim kuralını izler: gözler kapalı adımda 'warning', açıkta 'success'.
import { getPrefs } from './prefs.js'
import { PHRASES, VOICE_LANG, playPhrase, preloadVoice } from './voicePack.js'
import { breathContext } from './breathSfx.js'
import { speak } from './cue.js'
import { haptic } from './native.js'

// Yalnız ses (titreşimsiz): kendi titreşimini veren yerler (nefes aşamaları, ritim)
export function sayPhrase(id) {
  const p = getPrefs()
  if (!p.sound || !id) return
  if (!playPhrase(breathContext(), p.voice, id, 8)) speak(PHRASES[VOICE_LANG][id] ?? '')
}

// Titreşim + ses
export function cuePhrase(id, closed = false) {
  haptic(closed ? 'warning' : 'success')
  sayPhrase(id)
}

// Seçili sesin cümlelerini önceden çöz (ekran açılınca; ilk komut beklemeden çalsın)
export const preloadPhrases = () => preloadVoice(breathContext(), getPrefs().voice)
