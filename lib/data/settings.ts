export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = createClient()

  // 1. On va chercher spécifiquement la ligne où la clé est 'store_name'
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'store_name')
    .maybeSingle()

  if (error || !data) {
    if (error) console.error('getSiteSettings error:', error.message)
    return DEFAULTS
  }

  // 2. On extrait "Onyx Shop" depuis la colonne 'value'
  // Comme c'est du format JSONB dans ta base, on s'assure de récupérer du texte
  const storeName = typeof data.value === 'string' ? data.value : (data.value as any)?.store_name || DEFAULTS.storeName

  return {
    storeName: storeName || DEFAULTS.storeName,
    storeDescription: DEFAULTS.storeDescription,
    contactEmail: DEFAULTS.contactEmail,
    whatsappNumber: DEFAULTS.whatsappNumber, // On garde la valeur par défaut pour l'instant
  }
})
