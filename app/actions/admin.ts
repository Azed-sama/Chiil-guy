'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/supabase'

const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
})

type ActionResult = { success: true } | { success: false; error: string }

export async function updateOrderStatus(input: {
  orderId: string
  status: OrderStatus
}): Promise<ActionResult> {
  const parsed = updateOrderStatusSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Données invalides.' }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié.' }
  }

  // Vérification explicite du rôle admin. Le RLS (`orders_update_admin`)
  // bloque déjà toute écriture non-admin en base, mais cette vérification
  // ici permet un message d'erreur clair côté UI plutôt qu'un échec
  // silencieux, et protège la logique métier ci-dessous (décrémentation
  // de stock) qui ne doit s'exécuter que pour un admin légitime.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_blocked')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || profile.is_blocked) {
    return { success: false, error: 'Accès réservé aux administrateurs.' }
  }

  const { orderId, status: nextStatus } = parsed.data

  const { data: order, error: orderFetchError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .maybeSingle()

  if (orderFetchError || !order) {
    return { success: false, error: 'Commande introuvable.' }
  }

  // La décrémentation du stock n'a lieu qu'UNE SEULE FOIS, exactement
  // au moment où la commande passe pour la première fois à "processing"
  // (= confirmée avec le client sur WhatsApp). Si le statut est modifié
  // à nouveau ensuite (ex: processing -> shipped), on ne redécrémente
  // pas une seconde fois.
  const isEnteringProcessing = nextStatus === 'processing' && order.status !== 'processing'

  if (isEnteringProcessing) {
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId)

    if (itemsError) {
      console.error('updateOrderStatus items fetch error:', itemsError.message)
      return { success: false, error: 'Impossible de récupérer les articles de la commande.' }
    }

    // NOTE : lecture puis écriture du stock (pas de décrémentation
    // atomique). Acceptable pour un usage admin mono-utilisateur ;
    // si plusieurs admins traitent des commandes en parallèle un jour,
    // remplacer par une fonction Postgres RPC (UPDATE ... SET stock =
    // stock - qty) pour une décrémentation atomique côté base.
    for (const item of orderItems ?? []) {
      if (!item.product_id) continue // produit supprimé depuis, rien à décrémenter

      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .maybeSingle()

      if (!product) continue

      const newStock = Math.max(0, product.stock_quantity - item.quantity)

      const { error: stockError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.product_id)

      if (stockError) {
        console.error('updateOrderStatus stock update error:', stockError.message)
        return { success: false, error: 'Impossible de mettre à jour le stock.' }
      }
    }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: nextStatus })
    .eq('id', orderId)

  if (updateError) {
    console.error('updateOrderStatus error:', updateError.message)
    return { success: false, error: 'Impossible de mettre à jour le statut de la commande.' }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/produits')
  revalidatePath('/', 'layout')

  return { success: true }
}
