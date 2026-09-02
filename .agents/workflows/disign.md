---
description: 
---

Cette règle dicte les principes de conception visuelle, de mise en page, de couleurs et d'animations pour tous les composants de l'application StockHub. Tout nouveau composant **doit** respecter ces directives pour garantir la cohérence avec le tableau de bord existant.

## 1. Palette de Couleurs Principales
- **Bleu nuit (Marque / Sidebar / Boutons principaux)** : `bg-[#0b213f]`
  - Au survol (Hover) : `hover:bg-[#18355c]`
- **Texte principal (Titres / Valeurs)** : `text-slate-900`
- **Texte secondaire (Sous-titres / Labels)** : `text-slate-500` ou `text-slate-400`
- **Fond de l'application (Layout principal)** : `bg-slate-50` (Ne pas utiliser de fond blanc pur pour le body, pour faire ressortir les cartes).
- **Fond des Cartes / Conteneurs** : Blanc pur (`bg-white`).
- **Bordures** : Subtiles, utiliser `border-slate-200` ou `border-slate-100`.

## 2. Couleurs Sémantiques (Statuts, Badges, Icônes)
Toujours utiliser des combinaisons fond clair + texte foncé pour les statuts :
- **Succès / Positif (Payé, Ventes, Hausse)** : 
  - Fond : `bg-green-100` (ou `bg-green-50`)
  - Texte/Icône : `text-green-700` (ou `text-green-600`)
- **Alerte / Attente (Stock faible, En attente)** :
  - Fond : `bg-orange-100` (ou `bg-orange-50`)
  - Texte/Icône : `text-orange-700` (ou `text-orange-600`)
- **Critique / Négatif (Rupture, Dépenses, Baisse)** :
  - Fond : `bg-red-100` (ou `bg-red-50`)
  - Texte/Icône : `text-red-700` (ou `text-red-600`)
- **Informatif (Livré, Chiffre d'affaires)** :
  - Fond : `bg-blue-100` (ou `bg-blue-50`)
  - Texte/Icône : `text-blue-700` (ou `text-blue-600`)
- **Neutre (Stock total, Brouillon)** :
  - Fond : `bg-slate-200` (ou `bg-slate-100`)
  - Texte/Icône : `text-slate-700` (ou `text-slate-600`)

## 3. Style des Cartes (Cards)
Toute carte ou conteneur de données doit utiliser les classes suivantes :
- `shadow-sm border-slate-200 bg-white rounded-xl` (ou `rounded-lg`).
- Les titres de section dans les cartes doivent utiliser `text-base font-bold text-slate-900`.

## 4. Animations et Interactions (Micro-interactions)
Toutes les actions cliquables doivent comporter des animations fluides.
- **Boutons principaux / d'action** :
  - Classes obligatoires : `transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md`
- **Boutons secondaires (Filtres, Icônes seules, Toggle)** :
  - Classes obligatoires : `transition-all duration-200 active:scale-95 hover:bg-slate-50` (ou équivalent selon le contexte).
- **Liens textuels (ex: "Voir tout ->")** :
  - Classes obligatoires : `hover:translate-x-1 transition-transform duration-200` (pour les liens avec flèche) ou `hover:text-blue-700 transition-colors`.
- **Champs de saisie (Inputs)** :
  - Classes obligatoires : `focus:ring-2 focus:ring-blue-500 transition-all duration-300`.
  - Pour les barres de recherche : Ajouter un effet d'élargissement `focus:w-[taille_superieure]`.

## 5. Typographie et Espacements
- Utiliser la police par défaut de l'application.
- **Titres de page** : `text-2xl` ou `text-3xl font-bold tracking-tight text-slate-900`.
- Utiliser `font-semibold` ou `font-bold` pour mettre en évidence les données importantes dans les tableaux ou les cartes.
- Garder des espacements aérés (ex: `p-5` ou `p-6` pour l'intérieur des cartes, `gap-4` ou `gap-6` entre les éléments de grille).

## 6. Accessibilité et Mobile-First
- Toujours penser au rendu sur petit écran : utiliser `flex-col md:flex-row` pour les en-têtes complexes.
- Cacher les textes non essentiels sur mobile au profit d'icônes avec la classe `hidden md:inline` ou `md:block`.
- Les menus doivent utiliser une approche "Slide-over" (tiroir glissant depuis la gauche) avec un voile noir (`backdrop-blur-sm`).

**IMPORTANT** : Ne jamais utiliser de couleurs génériques brutes (ex: `bg-red-500` pour un badge) sans vérifier s'il existe une variante "Soft" (fond clair, texte foncé) comme défini dans la section 2. Ne jamais oublier les effets `hover:` et `active:scale-95` sur les boutons.