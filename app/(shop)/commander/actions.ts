"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Définition locale du schéma pour éviter les imports cassés sur Vercel
const checkoutSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  address: z.string().min(5, "L'adresse est trop courte"),
  city: z.string().min(2, "La ville est trop courte"),
  postalCode: z.string().optional().or(z.literal("")),
  paymentMethod: z.string(),
});

export async function createOrder(formData: FormData, cartItems: any[], subtotal: number, shippingCost: number, total: number) {
  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    paymentMethod: formData.get("paymentMethod"),
  };

  const parsed = checkoutSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: "Données de commande invalides. Veuillez vérifier le formulaire." };
  }

  if (!cartItems || cartItems.length === 0) {
    return { error: "Votre panier est vide." };
  }

  const supabase = await createClient();

  // Récupération de l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Vous devez être connecté pour passer une commande." };
  }

  // 1. Création de la commande principale (Contournement du type strict avec 'as any')
  const { data: order, error: orderError } = await (supabase
    .from("orders") as any)
    .insert({
      user_id: user.id,
      status: "pending",
      subtotal,
      shipping_cost: shippingCost,
      total,
      shipping_first_name: parsed.data.firstName,
      shipping_last_name: parsed.data.lastName,
      shipping_email: parsed.data.email,
      shipping_phone: parsed.data.phone,
      shipping_address: parsed.data.address,
      shipping_city: parsed.data.city,
      shipping_postal_code: parsed.data.postalCode,
      payment_method: parsed.data.paymentMethod,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Erreur lors de la création de la commande:", orderError);
    return { error: "Impossible d'enregistrer votre commande. Réessayez." };
  }

  // 2. Préparation des articles de la commande
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price,
    size: item.selectedSize || null,
    color: item.selectedColor || null,
  }));

  // Insertion des articles (Contournement du type avec 'as any')
  const { error: itemsError } = await (supabase
    .from("order_items") as any)
    .insert(orderItems);

  if (itemsError) {
    console.error("Erreur lors de l'enregistrement des articles de la commande:", itemsError);
    return { error: "Commande créée, mais un problème est survenu avec les articles." };
  }

  // 3. Optionnel : Vider le panier côté base de données si nécessaire
  await supabase.from("cart").delete().eq("user_id", user.id);

  revalidatePath("/profile/orders");
  
  return { success: true, orderId: order.id };
}
