import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export interface SiteSettings {
  storeName: string
  storeDescription: string
  contactEmail: string
  whatsappNumber: string
}

const DEFAULTS: SiteSettings = {
  storeName: 'Onyx Shop',
  storeDescription: 'Découvre notre sélection de produits, livrés où que tu sois.',
  contactEmail: '',
  whatsappNumber: '',
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settings')
    .select('store_name, store_description, contact_email, whatsapp_number')
    .eq('id', 1)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error('getSiteSettings error:', error.message)
    return DEFAULTS
  }

  return {
    storeName: data.store_name || DEFAULTS.storeName,
    storeDescription: data.store_description || DEFAULTS.storeDescription,
    contactEmail: data.contact_email || DEFAULTS.contactEmail,
    whatsappNumber: data.whatsapp_number || DEFAULTS.whatsappNumber,
  }
})