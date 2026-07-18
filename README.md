# Boutique — Site vitrine, catalogue, e-commerce, admin

## Stack

- **Frontend** : Next.js 14 (App Router), React 18, TypeScript strict
- **Style** : Tailwind CSS, thème clair/sombre (next-themes)
- **Backend** : Supabase (Postgres, Auth, Storage), Row Level Security partout
- **Paiement** : Stripe (mode test au démarrage)
- **Déploiement** : Vercel
- **Analytics** : Vercel Analytics

## Démarrage local

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev
```

Le site est disponible sur http://localhost:3000

## Base de données — nouveau projet Supabase

Le schéma complet tient dans un seul fichier :
`supabase/migrations/0000_full_schema.sql`.

1. Créer un nouveau projet sur https://supabase.com
2. Ouvrir **SQL Editor > New query**
3. Copier-coller tout le contenu de `0000_full_schema.sql` et cliquer sur **Run**
4. Récupérer l'URL et les clés API du projet (**Settings > API**) et les
   renseigner dans `.env.local`
5. Créer un compte via la page d'inscription du site, puis dans
   **Table Editor > profiles**, passer manuellement son `role` de
   `customer` à `admin` pour accéder au dashboard `/admin`

Ce script recrée en une seule fois : les types énumérés et fonctions
utilitaires (`is_admin()`, etc.), toutes les tables, toutes les policies
RLS, le bucket Storage `product-images` (images produits + catégories,
lecture publique / écriture admin) et la ligne de départ de la table
`settings`. Il est destiné à un projet Supabase **vierge** — pas besoin
d'exécuter plusieurs fichiers dans l'ordre.

## Structure du projet

```
/app
  /(marketing)   → site vitrine public (accueil, à propos, contact)
  /(shop)        → catalogue, fiche produit, panier, checkout
  /(auth)        → connexion, inscription, mot de passe oublié
  /account       → espace client protégé (profil, commandes, avis)
  /admin         → tableau de bord admin protégé (produits, commandes, stats)
  /api           → route handlers (webhook Stripe, etc.)

/components
  /ui            → composants réutilisables génériques
  /theme         → thème clair/sombre

/lib
  /supabase      → clients Supabase (browser / server / admin / middleware)
  /validations   → schémas Zod (validation formulaires + API)

/types
  supabase.ts    → types générés depuis le schéma SQL

/supabase
  /migrations    → schéma SQL versionné, source de vérité de la base
```

## Sécurité — points clés

- **RLS activé sur toutes les tables.** Le client anonyme ne peut jamais
  contourner les policies, même en cas de bug côté frontend.
- **3 clients Supabase distincts**, à ne jamais confondre :
  - `lib/supabase/client.ts` → composants navigateur, respecte le RLS
  - `lib/supabase/server.ts` → Server Components / Actions, respecte le RLS,
    utilise la session de l'utilisateur courant
  - `lib/supabase/admin.ts` → **service_role, contourne le RLS**. Réservé aux
    webhooks serveur et actions admin déjà vérifiées. Protégé par le
    package `server-only` (le build échoue s'il est importé côté client).
- **`middleware.ts`** protège `/admin` et `/account` côté serveur (vérifie
  authentification + rôle + statut bloqué), en complément du RLS qui reste
  la dernière ligne de défense sur les données elles-mêmes.

## Régénérer les types après une migration SQL

```bash
npx supabase login
npx supabase link --project-ref <ton-project-ref>
npm run supabase:types
```

## Prochaines étapes du projet

1. Authentification (inscription, connexion, mot de passe oublié)
2. Catalogue produits (liste, filtres, recherche, fiche produit)
3. Panier + tunnel de commande + intégration Stripe
4. Espace client (profil, historique commandes, avis)
5. Tableau de bord admin (produits, catégories, commandes, utilisateurs, stats)
