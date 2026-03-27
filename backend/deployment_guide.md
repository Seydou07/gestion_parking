# Guide de Déploiement : Fleet Guardian

Ce guide vous explique étape par étape comment déployer votre application sur Railway (Backend + Base de données) et Vercel (Frontend).

## 1. Déploiement du Backend sur Railway

Railway va héberger votre API NestJS et votre base de données MySQL.

### Étape A : Créer la Base de Données
1. Connectez-vous sur [railway.app](https://railway.app/).
2. Cliquez sur **"New Project"** (bouton en haut à droite).
3. Choisissez **"Provision MySQL"**. Cela crée instantanément un serveur de base de données.
4. Une fois créé, cliquez sur le bloc **"MySQL"** qui vient d'apparaître.
5. Allez dans l'onglet **"Variables"**. Vous y verrez `MYSQL_URL`. Railway l'utilisera automatiquement pour le backend s'ils sont dans le même projet sous le nom `DATABASE_URL`.

### Étape B : Déployer l'API NestJS
1. Dans le même projet Railway, cliquez sur **"New"** -> **"GitHub Repo"**.
2. Sélectionnez votre dépôt `fleet-guardian-main`.
3. Railway va analyser le projet. Allez dans les **"Settings"** du service `fleet-guardian-main` :
   - Sous **"General"** -> **"Root Directory"**, mettez `backend`.
4. Allez dans l'onglet **"Variables"** et cliquez sur **"New Variable"** pour ajouter :
   - `JWT_SECRET` : Une phrase secrète (ex: `ma_cle_secrete_2024`).
   - `NODE_ENV` : `production`
   - `DATABASE_URL` : (Si elle n'est pas déjà présente, utilisez `${{MySQL.MYSQL_URL}}`).
   - `FRONTEND_URL` : (Laissez vide pour l'instant, on y reviendra après l'étape Vercel).
5. Cliquez sur **"Deploy"**. Railway va construire (build) et lancer l'API.
6. Une fois déployé, allez dans **"Settings"** -> **"Public Networking"** et cliquez sur **"Generate Domain"** pour obtenir l'URL de votre API (ex: `https://backend-production-xyz.up.railway.app`). Copiez cette URL.

---

## 2. Déploiement du Frontend sur Vercel

### Étape A : Configuration
1. Connectez-vous sur [vercel.com](https://vercel.com/).
2. Cliquez sur **"Add New"** -> **"Project"**.
3. Importez votre dépôt GitHub `fleet-guardian-main`.
4. Dans les paramètres de configuration (Project Settings) :
   - **Root Directory** : Cliquez sur **"Edit"** et sélectionnez le dossier `frontend`.
   - **Framework Preset** : Doit être **"Next.js"**.
5. Ouvrez la section **"Environment Variables"** et ajoutez :
   - `NEXT_PUBLIC_API_URL` : Collez l'URL de votre API Railway (Ajoutez `/api` à la fin, ex: `https://backend-production-xyz.up.railway.app/api`).
6. Cliquez sur **"Deploy"**.

---

## 3. Liaison Finale (L'étape oubliée !)

Une fois que Vercel a fini le déploiement, il vous donne une URL (ex: `https://fleet-guardian.vercel.app`).

1. Retournez sur **Railway**.
2. Cliquez sur votre service **Backend**.
3. Allez dans l'onglet **"Variables"**.
4. Modifiez la variable `FRONTEND_URL` avec l'URL de Vercel (ex: `https://fleet-guardian.vercel.app`).
5. Railway va redémarrer automatiquement le backend pour appliquer le changement.

**Félicitations ! Votre application est en ligne.** 🎉
