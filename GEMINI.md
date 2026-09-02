# StockHub - Documentation & Directives pour l'IA (Gemini)

Ce fichier sert de point de référence absolu pour comprendre l'architecture, les fonctionnalités et les décisions de design du projet **StockHub**. 
Il doit être consulté par le modèle IA à chaque nouvelle session pour s'imprégner du contexte et éviter de casser l'existant.

## 1. Ce que fait l'application
StockHub est une application web hybride combinant :
- **Un système de gestion (ERP/CRM/POS) en back-office** : Destiné au propriétaire et à ses employés pour gérer les stocks, les ventes, les clients et la facturation.
- **Une vitrine en ligne (Boutique en ligne)** : Destinée aux clients finaux pour consulter le catalogue, créer un panier, et finaliser leur commande via WhatsApp.

## 2. Fonctionnalités implémentées

### Vitrine en ligne (`/b/[shopId]`)
- Affichage du catalogue avec recherche et filtres par catégories.
- Gestion des prix dynamiques (prix de base, prix promotionnel, offres en "Pack").
- Panier d'achat interactif.
- **Mur d'authentification (Capture de leads)** : Obligation pour le client de s'identifier (Nom, Téléphone WhatsApp) avant de valider sa commande.
- Checkout via WhatsApp : Génération d'un message pré-formaté avec le détail du panier.
- Enregistrement automatique de la commande dans le tableau de bord (Ventes) et du client dans le CRM avec la source "En ligne".

### Tableau de bord (`/dashboard`)
- **Système d'Authentification (Rôles)** : 
  - *Propriétaire* : Accès total.
  - *Employé* : Accès restreint (Ventes, Factures, Stock, Clients). Redirection sécurisée via un `AuthGuard`.
- **Gestion d'Équipe** : Création/Suppression d'employés, génération de code PIN, partage des accès.
- **Ventes & Commandes** : Historique des transactions (Sur place vs En ligne).
- **Rapports** : Statistiques financières séparant le "CA En ligne" du "CA Sur place".
- **CRM (Clients)** : Base de données clients, avec un badge "Boutique en ligne" pour ceux acquis via la vitrine.
- **Stock & Produits** : Gestion du catalogue.
- **Factures** : Création et suivi des facturations.

## 3. Technologies utilisées
- **Framework Core** : Next.js 14+ (App Router) / React
- **Langage** : TypeScript
- **Styling** : Tailwind CSS (avec `clsx` et `tailwind-merge` via `@/lib/utils`)
- **Icônes** : Lucide React
- **Base de données / Persistance** : Pour le moment, tout est simulé via le `localStorage` du navigateur (fichiers dans `src/lib/mock/`).

## 4. Structure des fichiers clés
- `src/app/login/page.tsx` : Interface de connexion.
- `src/app/b/[shopId]/page.tsx` : Logique et UI de la vitrine en ligne (Boutique).
- `src/app/(dashboard)/layout.tsx` : Structure globale du tableau de bord, enveloppée par `<AuthGuard>`.
- `src/components/dashboard/auth-guard.tsx` : Protection des routes selon les permissions (`currentUser.role`).
- `src/components/dashboard/sidebar.tsx` : Menu latéral dynamique.
- `src/lib/mock/` : Contient toute la logique de base de données simulée (`auth.ts`, `clients.ts`, `orders.ts`, etc.). Ces hooks gèrent la synchronisation avec le `localStorage`.

## 5. Décisions de Design (Aesthetics)
- **Premium & Moderne** : L'interface doit avoir un effet "Wow" (utilisation de couleurs harmonieuses, mode clair lumineux pour la boutique, bleu profond `#0b213f` pour le dashboard).
- **Micro-animations** : Utilisation de transitions douces, hover effects (`hover:bg-slate-50`, `transition-all`), et design épuré (pas de surcharge d'informations).
- **Indicateurs visuels clairs** : Badges colorés pour le statut (En ligne, Sur place, Actif, En attente).

## 6. Instructions pour les futures modifications par l'IA
> [!IMPORTANT]
> - **Règle d'or sur la donnée** : Ne jamais coder en dur un état local dans un composant (ex: `useState` isolé pour les clients) si cette donnée doit être partagée. Toujours utiliser (ou créer) un hook dans `src/lib/mock/` qui lit/écrit dans le `localStorage`.
> - **Gestion des Rôles** : Si une nouvelle page est ajoutée au tableau de bord, toujours vérifier si elle doit être accessible aux employés ou réservée au propriétaire. Mettre à jour `auth-guard.tsx` et `sidebar.tsx` en conséquence.
> - **Typage Strict** : Les objets comme `Contact` ou `Order` possèdent un champ `source?: "En ligne" | "Sur place"`. Maintenez cette distinction lors de la création de nouvelles entités pour préserver l'exactitude des rapports.
> - **Vitrine vs Dashboard** : La vitrine (`/b/[shopId]`) est "publique", elle lit le `localStorage` mais ne doit pas avoir accès aux fonctionnalités destructrices. Le `dashboard` nécessite une session active.
