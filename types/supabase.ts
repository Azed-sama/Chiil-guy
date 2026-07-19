// =========================================================
// Types générés à partir du schéma Supabase (supabase/migrations).
// Une fois le projet lié en local, régénérer avec :
//   npm run supabase:types
// pour rester parfaitement synchronisé avec la base de données.
// =========================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'customer' | 'admin'

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: UserRole
          is_blocked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_blocked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          price: number
          sale_price: number | null
          sale_starts_at: string | null
          sale_ends_at: string | null
          sku: string | null
          stock_quantity: number
          is_featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string | null
          price: number
          sale_price?: number | null
          sale_starts_at?: string | null
          sale_ends_at?: string | null
          sku?: string | null
          stock_quantity?: number
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['product_images']['Insert']>
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['cart_items']['Insert']>
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: OrderStatus
          subtotal: number
          shipping_cost: number
          total_amount: number
          shipping_address: Json
          contact_email: string | null
          contact_phone: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: OrderStatus
          subtotal: number
          shipping_cost?: number
          total_amount: number
          shipping_address: Json
          contact_email?: string | null
          contact_phone?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_image_url: string | null
          unit_price: number
          quantity: number
          subtotal: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_image_url?: string | null
          unit_price: number
          quantity: number
          subtotal: number
        }
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: number
          comment: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_id?: string | null
          rating: number
          comment?: string | null
          is_approved?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          subject: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject?: string | null
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['contact_messages']['Insert']>
      }
      settings: {
        Row: {
          id: number
          store_name: string
          store_description: string | null
          contact_email: string | null
          whatsapp_number: string
          updated_at: string
        }
        Insert: {
          id?: number
          store_name?: string
          store_description?: string | null
          contact_email?: string | null
          whatsapp_number?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['settings']['Insert']>
      }
    }
    Views: {
      products_with_effective_price: {
        Row: Database['public']['Tables']['products']['Row'] & {
          effective_price: number
          is_on_sale: boolean
        }
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_blocked: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      order_status: OrderStatus
    }
  }
}

// Raccourcis pratiques pour usage dans les composants
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Product = Tables<'products'>
export type ProductWithEffectivePrice = Database['public']['Views']['products_with_effective_price']['Row']
export type ProductImage = Tables<'product_images'>
export type Category = Tables<'categories'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Profile = Tables<'profiles'>
export type Review = Tables<'reviews'>
export type CartItem = Tables<'cart_items'>
