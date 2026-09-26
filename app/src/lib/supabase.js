// Supabase istemcisi (hesap: Apple / e-posta kodu; profil eşitleme). docs/supabase/001_hesap.sql tabloları kurar.
// Adres ve anahtar HERKESE AÇIK türdendir (publishable): istemci uygulamasında bulunması için tasarlanmıştır; kim neyi
// okuyup yazabilir, sunucudaki RLS kuralları belirler (her kişi yalnız kendi satırı). Gizli anahtar (sb_secret_… /
// service_role) bu uygulamaya ASLA konmaz; aşağıdaki kontrol yanlışlıkla konursa istemciyi kurmaz.
import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://ueydpapmrpdjbnfeijgi.supabase.co'
export const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_EzYKMBjnV4o4eYp_enozaQ_NY2gAqVv'

export const isSecretKey = (k) => typeof k === 'string' && (k.startsWith('sb_secret_') || k.includes('service_role'))

let client = null
export function supabase() {
  if (client) return client
  if (isSecretKey(SUPABASE_KEY)) throw new Error('Gizli Supabase anahtarı uygulamada kullanılamaz')
  client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'gozolcum:auth' },
  })
  return client
}

// Yalnız testler: sahte istemci
export function setSupabaseForTest(c) {
  client = c
}
