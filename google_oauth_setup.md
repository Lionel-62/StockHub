# Configuration de l'Authentification Google (Supabase)

Pour permettre à vos commerçants de s'inscrire ou se connecter en un clic avec Google (et ainsi activer la création automatique de leur boutique), vous devez lier Google et Supabase.

Voici la démarche étape par étape (cela prend environ 5 minutes).

## Étape 1 : Obtenir les clés chez Google

1. Allez sur la [Console Google Cloud](https://console.cloud.google.com/).
2. Connectez-vous avec votre compte Google et créez un **Nouveau Projet** (ex: `StockHub Auth`).
3. Dans le menu de gauche, allez dans **API et services** > **Écran de consentement OAuth**.
   - Choisissez **Externe** et cliquez sur Créer.
   - Remplissez les champs obligatoires (Nom de l'application : `StockHub`, Adresses e-mail d'assistance).
   - Cliquez sur **Enregistrer et continuer** jusqu'à la fin (vous n'avez pas besoin d'ajouter de champs d'application spécifiques).
4. Toujours dans le menu de gauche, allez dans **Identifiants**.
   - Cliquez en haut sur **+ CRÉER DES IDENTIFIANTS** > **ID client OAuth**.
   - Type d'application : **Application Web**.
   - Nom : `StockHub Web`.
   - Dans **Origines JavaScript autorisées**, ajoutez les URL de votre site (ex: `http://localhost:3000` pour les tests, et votre URL Vercel finale `https://votre-site.vercel.app`).
   - Dans **URI de redirection autorisés**, copiez et collez EXACTEMENT cette URL fournie par votre Supabase :
     👉 `https://yqklqmheftloijgwtxkr.supabase.co/auth/v1/callback`
   - Cliquez sur **Créer**.

> [!IMPORTANT]
> Une fenêtre va s'afficher avec **Votre ID client** et **Votre code secret du client**. Gardez cette fenêtre ouverte, vous en aurez besoin à l'étape suivante !

---

## Étape 2 : Configurer Supabase

1. Ouvrez votre [Tableau de bord Supabase](https://supabase.com/dashboard) et allez dans votre projet `STOCKHUB`.
2. Dans le menu de gauche, cliquez sur l'icône **Authentication** (les deux petits bonshommes).
3. Cliquez sur **Providers** (Fournisseurs) dans le sous-menu de gauche.
4. Trouvez **Google** dans la liste et cliquez dessus pour l'ouvrir.
5. Activez l'interrupteur **Enable Google**.
6. Collez les deux clés obtenues à l'étape 1 :
   - **Client ID** (ID client)
   - **Client Secret** (Code secret du client)
7. Laissez les autres options par défaut et cliquez sur **Save** (Enregistrer).

---

## Étape 3 : Vérifier l'URL du site (Redirection)

Pour que Google sache où renvoyer l'utilisateur après la connexion :
1. Dans Supabase (toujours dans Authentication), allez dans **URL Configuration**.
2. Dans le champ **Site URL**, assurez-vous de mettre l'URL de votre site en production (ex: `https://votre-site.vercel.app`) ou `http://localhost:3000` si vous êtes en train de tester sur votre ordinateur.
3. Si vous avez plusieurs URL (ex: une locale et une en production), ajoutez les autres dans **Redirect URLs** juste en dessous.

## C'est terminé ! 🎉

Maintenant, si vous cliquez sur le bouton "Se connecter avec Google" dans votre application :
1. La fenêtre Google va s'ouvrir.
2. Une fois validé, Supabase créera l'utilisateur dans `auth.users`.
3. Notre fameux **Trigger** va s'activer pour créer automatiquement son profil et sa boutique.
4. Le commerçant atterrira sur son tableau de bord !
