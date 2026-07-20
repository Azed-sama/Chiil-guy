'use server'

import { createClient } from '@/lib/supabase/server'
import { getCartItems } from '@/lib/data/cart'
import { getSiteSettings } from '@/lib/data/settings'
import { getEffectivePrice } from '@/lib/utils'
import { shippingInfoSchema, type ShippingInfoInput } from '@/lib/validations/order'

type CreateOrderResult = |
  { success: true;orderReference: string;whatsappUrl: string } |
  { success: false;error: string }

export async function createOrder(input: ShippingInfoInput): Promise < CreateOrderResult > {
  const parsed = shippingInfoSchema.safeParse(input)
  
  if (!parsed.success) {
    return { success: false, error: 'Données de commande invalides. Veuillez vérifier le formulaire.' }
  }
  
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Une erreur est survenue. Merci de recharger la page et réessayer.' }
  }
  
  const items = await getCartItems()
  if (items.length === 0) {
    return { success: false, error: 'Votre panier est vide.' }
  }
  
  const subtotal = items.reduce(
    (sum, item) => sum + getEffectivePrice(item.product).price * item.quantity,
    0
  )
  const shippingCost = 0
  const totalAmount = subtotal + shippingCost
  
  // 1. Création de la commande
  const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({
    user_id: user.id,
    status: 'pending',
    subtotal,
    shipping_cost: shippingCost,
    total_amount: totalAmount,
    shipping_address: {
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      city: parsed.data.city,
      address: parsed.data.address,
    },
    contact_email: parsed.data.email,
    contact_phone: parsed.data.phone,
    notes: parsed.data.notes || null,
  })
  .select('id')
  .single()
  
  if (orderError || !order) {
    console.error('createOrder error:', orderError?.message)
    return { success: false, error: "Impossible d'enregistrer votre commande. Réessayez." }
  }
  
  // 2. Lignes de commande (snapshot des infos produit au moment de l'achat)
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    product_name: item.product.name,
    product_image_url: item.product.image?.url ?? null,
    unit_price: getEffectivePrice(item.product).price,
    quantity: item.quantity,
    subtotal: getEffectivePrice(item.product).price * item.quantity,
  }))
  
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  
  if (itemsError) {
    console.error('createOrder items error:', itemsError.message)
    return { success: false, error: 'Commande créée, mais un problème est survenu avec les articles.' }
  }
  
  // 3. Vider le panier
  await supabase.from('cart_items').delete().eq('user_id', user.id)
  
  // 4. Construire le lien WhatsApp avec le récapitulatif
  const settings = await getSiteSettings()
  const orderReference = order.id.slice(0, 8).toUpperCase()
  
  const lines = items.map(
    (item) => `- ${item.quantity} × ${item.product.name}`
  )
  const message = [
      `Bonjour, je souhaite finaliser ma commande ${orderReference} :`,
      ...lines,
      ``,
      `Nom : ${parsed.data.fullName}`,
      `Téléphone : ${parsed.data.phone}`,
      `Ville : ${parsed.data.city}`,
      `Adresse : ${parsed.data.address}`,
      parsed.data.notes ? `Note : ${parsed.data.notes}` : null,
    ]
    .filter(Boolean)
    .join('\n')
  
  const phoneDigitsOnly = settings.whatsappNumber.replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${phoneDigitsOnly}?text=${encodeURIComponent(message)}`
  
  return { success: true, orderReference, whatsappUrl }
}