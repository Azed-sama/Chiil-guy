"use server";

import { createClient } from "@/lib/supabase/server";
import { contactFormSchema } from "@/lib/validations/contact";

export async function sendContactMessage(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  const parsed = contactFormSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: "Données de formulaire invalides." };
  }

  const supabase = await createClient();

  // "as any" permet de contourner la vérification stricte de TypeScript sur la table contact_messages
  const { error } = await (supabase.from("contact_messages") as any).insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });

  if (error) {
    console.error("Erreur d'envoi du message:", error);
    return { error: "Une erreur est survenue lors de l'envoi de votre message." };
  }

  return { success: true };
}
