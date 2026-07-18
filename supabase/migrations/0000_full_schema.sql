-- =========================================================
-- SCHÉMA COMPLET — Azed e-commerce (Next.js + Supabase)
-- =========================================================
-- Script unique, à copier-coller intégralement dans l'éditeur
-- SQL d'un NOUVEAU projet Supabase (Dashboard > SQL Editor > New query),
-- puis "Run" une seule fois.
--
-- Il recrée depuis zéro :
--   - extensions, types énumérés, fonctions utilitaires (is_admin, etc.)
--   - toutes les tables (profiles, categories, products, product_images,
--     cart_items, orders, order_items, reviews, contact_messages, settings)
--   - toutes les policies RLS
--   - le bucket Storage "product-images" (produits + catégories) et ses
--     policies (lecture publique, écriture admin uniquement)
--   - les données de départ minimales (ligne unique de "settings")
--
-- Le script est idempotent pour la partie "settings" (peut être relancé
-- sans erreur si la table existe déjà) mais est destiné à un projet
-- Supabase VIERGE : sur un projet où les tables existent déjà, relancer
-- provoquera des erreurs "already exists" sur les tables/types/policies.
-- =========================================================


-- =========================================================
-- 1. EXTENSIONS
-- =========================================================

create extension if not exists "pgcrypto";


-- =========================================================
-- 2. TYPES ÉNUMÉRÉS
-- =========================================================

create type public.user_role as enum ('customer', 'admin');

create type public.order_status as enum (
  'pending',     -- commande créée, paiement en attente
  'paid',        -- paiement confirmé (webhook Stripe)
  'processing',  -- en préparation
  'shipped',     -- expédiée
  'delivered',   -- livrée
  'cancelled',   -- annulée
  'refunded'     -- remboursée
);


-- =========================================================
-- 3. FONCTIONS UTILITAIRES GLOBALES (partie 1 — sans dépendance à profiles)
-- =========================================================

-- Mise à jour automatique de updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =========================================================
-- 4. PROFILS UTILISATEURS (extension de auth.users)
-- =========================================================
-- NOTE D'ORDRE : la table doit exister AVANT is_admin()/is_blocked()
-- ci-dessous, car une fonction LANGUAGE SQL est validée contre le
-- catalogue Postgres dès sa création (contrairement à PL/pgSQL) :
-- si public.profiles n'existe pas encore, "create function is_admin()"
-- échoue avec l'erreur "relation public.profiles does not exist".

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  avatar_url   text,
  role         public.user_role not null default 'customer',
  is_blocked   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'Profil étendu de chaque utilisateur, lié 1:1 à auth.users';

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------
-- Fonctions utilitaires (partie 2 — dépendent de public.profiles)
-- ---------------------------------------------------------

-- Vérifie si l'utilisateur courant est admin.
-- SECURITY DEFINER : s'exécute avec les droits du créateur, ce qui
-- permet de lire la table profiles même si le demandeur n'a pas
-- directement le droit de la lire. Utilisée par toutes les policies
-- RLS "admin only".
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_blocked = false
  );
$$;

-- Vérifie si le compte courant est bloqué.
-- Utilisée pour interdire toute écriture à un compte suspendu.
create or replace function public.is_blocked()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_blocked from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

-- Un utilisateur peut lire son propre profil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- L'admin peut lire tous les profils
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

-- Un utilisateur peut modifier son propre profil, MAIS ne peut jamais
-- changer son propre rôle ni son statut is_blocked (protection contre
-- l'auto-promotion admin)
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id and public.is_blocked() = false)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
    and is_blocked = (select is_blocked from public.profiles where id = auth.uid())
  );

-- L'admin peut tout modifier (y compris rôles et blocage)
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

-- Personne ne peut insérer manuellement (géré par le trigger handle_new_user)
-- Personne ne peut supprimer un profil directement (cascade depuis auth.users)


-- =========================================================
-- 5. CATALOGUE : catégories, produits, images produits
-- =========================================================

-- ---------------------------------------------------------
-- Catégories
-- ---------------------------------------------------------

create table public.categories (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null unique,
  description    text,
  image_url      text,
  display_order  integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.categories
  for each row execute function public.handle_updated_at();

create index idx_categories_display_order on public.categories (display_order);

-- ---------------------------------------------------------
-- Produits
-- ---------------------------------------------------------

create table public.products (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid references public.categories(id) on delete set null,
  name             text not null,
  slug             text not null unique,
  description      text,
  price            numeric(10,2) not null check (price >= 0),

  -- Gestion des promotions : un produit est "en promo" si sale_price
  -- est renseigné ET que la date courante est dans la fenêtre définie
  -- (ou si aucune fenêtre n'est définie, la promo est active dès que
  -- sale_price est renseigné).
  sale_price       numeric(10,2) check (sale_price is null or sale_price >= 0),
  sale_starts_at   timestamptz,
  sale_ends_at     timestamptz,

  sku              text unique,
  stock_quantity   integer not null default 0 check (stock_quantity >= 0),
  is_featured      boolean not null default false,
  is_active        boolean not null default true,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint sale_price_lower_than_price check (
    sale_price is null or sale_price < price
  ),
  constraint sale_window_valid check (
    sale_starts_at is null or sale_ends_at is null or sale_starts_at < sale_ends_at
  )
);

create trigger set_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

create index idx_products_category on public.products (category_id);
create index idx_products_active on public.products (is_active);
create index idx_products_featured on public.products (is_featured) where is_featured = true;
-- Index pour la recherche texte (nom + description)
create index idx_products_search on public.products
  using gin (to_tsvector('french', coalesce(name, '') || ' ' || coalesce(description, '')));

-- Vue pratique : prix effectif (tient compte de la promo en cours)
create or replace view public.products_with_effective_price as
select
  p.*,
  case
    when p.sale_price is not null
      and (p.sale_starts_at is null or now() >= p.sale_starts_at)
      and (p.sale_ends_at is null or now() <= p.sale_ends_at)
    then p.sale_price
    else p.price
  end as effective_price,
  (
    p.sale_price is not null
    and (p.sale_starts_at is null or now() >= p.sale_starts_at)
    and (p.sale_ends_at is null or now() <= p.sale_ends_at)
  ) as is_on_sale
from public.products p;

-- ---------------------------------------------------------
-- Images produits (plusieurs images par produit)
-- ---------------------------------------------------------

create table public.product_images (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  url            text not null,
  alt_text       text,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now()
);

create index idx_product_images_product on public.product_images (product_id, display_order);

-- ---------------------------------------------------------
-- Row Level Security — catalogue
-- ---------------------------------------------------------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- Lecture publique des catégories actives (visiteurs + clients)
create policy "categories_select_public"
  on public.categories for select
  using (is_active = true);

-- L'admin voit et gère tout
create policy "categories_all_admin"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- Lecture publique des produits actifs
create policy "products_select_public"
  on public.products for select
  using (is_active = true);

create policy "products_all_admin"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- Images : lisibles si le produit parent est actif ou public visible
create policy "product_images_select_public"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true
    )
  );

create policy "product_images_all_admin"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());


-- =========================================================
-- 6. COMMERCE : panier, commandes, lignes de commande
-- =========================================================

-- ---------------------------------------------------------
-- Panier
-- ---------------------------------------------------------

create table public.cart_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  product_id   uuid not null references public.products(id) on delete cascade,
  quantity     integer not null default 1 check (quantity > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, product_id)
);

create trigger set_updated_at
  before update on public.cart_items
  for each row execute function public.handle_updated_at();

create index idx_cart_items_user on public.cart_items (user_id);

-- ---------------------------------------------------------
-- Commandes
-- ---------------------------------------------------------
-- NOTE IMPORTANTE : la confirmation de paiement (passage à 'paid') et
-- la création définitive de la commande se font côté serveur via
-- le webhook Stripe, en utilisant la clé service_role qui contourne
-- le RLS. Cela évite qu'un client puisse falsifier un montant ou un
-- statut de commande depuis le navigateur.

create table public.orders (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid references auth.users(id) on delete set null,
  status                      public.order_status not null default 'pending',

  subtotal                    numeric(10,2) not null check (subtotal >= 0),
  shipping_cost               numeric(10,2) not null default 0 check (shipping_cost >= 0),
  total_amount                numeric(10,2) not null check (total_amount >= 0),

  shipping_address            jsonb not null,
  billing_address              jsonb,

  contact_email               text not null,
  contact_phone                text,

  stripe_checkout_session_id  text unique,
  stripe_payment_intent_id    text unique,

  notes                        text,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

create index idx_orders_user on public.orders (user_id);
create index idx_orders_status on public.orders (status);
create index idx_orders_created on public.orders (created_at desc);

-- ---------------------------------------------------------
-- Lignes de commande
-- ---------------------------------------------------------
-- Les données produit (nom, prix, image) sont dupliquées ("snapshot")
-- au moment de la commande : si le produit est modifié ou supprimé
-- plus tard, l'historique de commande reste exact.

create table public.order_items (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references public.orders(id) on delete cascade,
  product_id         uuid references public.products(id) on delete set null,
  product_name       text not null,
  product_image_url  text,
  unit_price         numeric(10,2) not null check (unit_price >= 0),
  quantity           integer not null check (quantity > 0),
  subtotal           numeric(10,2) not null check (subtotal >= 0)
);

create index idx_order_items_order on public.order_items (order_id);
create index idx_order_items_product on public.order_items (product_id);

-- ---------------------------------------------------------
-- Row Level Security — commerce
-- ---------------------------------------------------------

alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Panier : chaque utilisateur gère uniquement ses propres lignes
create policy "cart_items_all_own"
  on public.cart_items for all
  using (auth.uid() = user_id and public.is_blocked() = false)
  with check (auth.uid() = user_id and public.is_blocked() = false);

create policy "cart_items_all_admin"
  on public.cart_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- Commandes : un client voit uniquement ses propres commandes
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

-- Un client peut créer une commande "pending" pour lui-même
-- (la confirmation de paiement se fait ensuite côté serveur)
create policy "orders_insert_own"
  on public.orders for insert
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and public.is_blocked() = false
  );

-- Seul l'admin peut modifier une commande (statut, notes, etc.)
create policy "orders_update_admin"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders_select_admin"
  on public.orders for select
  using (public.is_admin());

-- Lignes de commande : visibles si la commande parente appartient au client
create policy "order_items_select_own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "order_items_insert_own"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
        and o.status = 'pending'
    )
  );

create policy "order_items_all_admin"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());


-- =========================================================
-- 7. AVIS PRODUITS ET MESSAGES DE CONTACT
-- =========================================================

-- ---------------------------------------------------------
-- Avis produits
-- ---------------------------------------------------------
-- Un avis doit être rattaché à une commande livrée du même
-- utilisateur pour garantir qu'il s'agit d'un achat vérifié.

create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  order_id      uuid references public.orders(id) on delete set null,
  rating        integer not null check (rating between 1 and 5),
  comment       text,
  is_approved   boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (product_id, user_id)
);

create index idx_reviews_product on public.reviews (product_id) where is_approved = true;

-- ---------------------------------------------------------
-- Messages de contact
-- ---------------------------------------------------------

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_contact_messages_unread on public.contact_messages (is_read) where is_read = false;

-- ---------------------------------------------------------
-- Row Level Security — avis et contact
-- ---------------------------------------------------------

alter table public.reviews enable row level security;
alter table public.contact_messages enable row level security;

-- Lecture publique des avis approuvés uniquement
create policy "reviews_select_public"
  on public.reviews for select
  using (is_approved = true);

-- Le client voit aussi ses propres avis, même non encore approuvés
create policy "reviews_select_own"
  on public.reviews for select
  using (auth.uid() = user_id);

-- Un client ne peut laisser un avis que sur un produit qu'il a
-- réellement acheté (commande livrée, statut 'delivered')
create policy "reviews_insert_verified_purchase"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and public.is_blocked() = false
    and exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.user_id = auth.uid()
        and o.status = 'delivered'
        and oi.product_id = reviews.product_id
    )
  );

-- Le client peut modifier/supprimer son propre avis
create policy "reviews_update_own"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reviews_delete_own"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- L'admin gère la modération (approuver / supprimer tout avis)
create policy "reviews_all_admin"
  on public.reviews for all
  using (public.is_admin())
  with check (public.is_admin());

-- Contact : n'importe qui (même non connecté) peut envoyer un message
create policy "contact_messages_insert_public"
  on public.contact_messages for insert
  with check (true);

-- Seul l'admin peut lire / gérer les messages reçus
create policy "contact_messages_all_admin"
  on public.contact_messages for all
  using (public.is_admin())
  with check (public.is_admin());


-- =========================================================
-- 8. STORAGE — bucket images (produits + catégories)
-- =========================================================
-- Un seul bucket "product-images" est utilisé à la fois pour les
-- images de produits et les images de catégories (c'est déjà ce que
-- fait le code : components/admin/product-image-uploader.tsx et
-- components/admin/category-image-uploader.tsx pointent tous les deux
-- vers ce bucket, simplement dans des sous-dossiers différents).
--
-- Bucket public en lecture (les images doivent être affichables sur
-- le site sans authentification), écriture réservée aux admins.
--
-- Aucune restriction de type MIME ni d'extension n'est appliquée au
-- niveau du bucket (allowed_mime_types laissé à NULL) : les photos
-- envoyées depuis la galerie d'un téléphone Android (JPEG, PNG, WEBP,
-- HEIC convertis, etc.) sont acceptées sans configuration supplémentaire.
-- Seule une limite de taille est fixée côté application (5 Mo, voir
-- product-image-uploader.tsx / category-image-uploader.tsx).

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Lecture publique (visiteurs, clients, moteurs de recherche)
create policy "product_images_public_read"
on storage.objects for select
using (bucket_id = 'product-images');

-- Écriture réservée aux admins (réutilise la fonction is_admin()
-- créée à l'étape 3)
create policy "product_images_admin_insert"
on storage.objects for insert
with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_update"
on storage.objects for update
using (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_delete"
on storage.objects for delete
using (bucket_id = 'product-images' and public.is_admin());


-- =========================================================
-- 9. PARAMÈTRES GÉNÉRAUX DU SITE (table à une seule ligne)
-- =========================================================
-- Permet de piloter depuis la base de données (ou le dashboard admin)
-- le nom de la boutique, le contact WhatsApp/email, etc. sans jamais
-- toucher au code.

create table public.settings (
  id                  smallint primary key default 1 check (id = 1),
  store_name          text not null default 'Nom de la boutique',
  store_description   text,
  contact_email       text,
  whatsapp_number     text not null default '22959047796',
  updated_at          timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.settings
  for each row execute function public.handle_updated_at();

-- Ligne unique, créée seulement si absente
insert into public.settings (id)
values (1)
on conflict (id) do nothing;

alter table public.settings enable row level security;

-- Lecture publique : le nom de la boutique et le contact sont affichés
-- sur tout le site, y compris pour les visiteurs non connectés.
create policy "settings_select_public"
on public.settings for select
using (true);

-- Écriture réservée aux admins
create policy "settings_all_admin"
on public.settings for all
using (public.is_admin())
with check (public.is_admin());


-- =========================================================
-- FIN DU SCRIPT
-- =========================================================
-- Prochaine étape : dans l'onglet Table Editor > profiles, changez
-- manuellement le rôle ('customer' -> 'admin') du premier utilisateur
-- que vous créez via la page d'inscription du site, afin d'avoir accès
-- au dashboard admin (/admin). Les inscriptions suivantes resteront
-- 'customer' par défaut.
-- =========================================================
