# 🛡️ Fleet Guardian - Entreprise Fleet Management

**Fleet Guardian** est une solution logicielle d'entreprise robuste, conçue pour centraliser, automatiser et optimiser la gestion de flottes automobiles complexes. Transformée d'une solution spécifique en une plateforme **White-Label**, elle permet aux entreprises de suivre en temps réel leurs actifs, leurs chauffeurs et leurs dépenses.

---

## 🌟 Fonctionnalités Clés

### 🚗 Gestion des Véhicules & Équipements
- **Inventaire Centralisé** : Suivi détaillé de chaque véhicule (Marque, Modèle, Immatriculation, Type de carburant).
- **Suivi Kilométrique** : Mise à jour automatique des compteurs pour un suivi précis de l'usure.
- **Statut en Temps Réel** : Visualisation instantanée de la disponibilité (En service, En maintenance, En mission).

### 👨‍✈️ Gestion des Chauffeurs & Personnel
- **Profils Complets** : Dossier chauffeur incluant les coordonnées, le type de permis et l'historique d'affectation.
- **Affectations Dynamiques** : Gestion fluide des relations conducteurs-véhicules pour éviter les conflits d'horaires.

### ⛽ Gestion du Carburant (Automatisée)
- **Suivi des Cartes Carburant** : Gestion des dotations, des soldes et des plafonds par carte.
- **Bons de Carburant** : Génération et suivi des bons pour un contrôle strict des consommations.
- **Alertes de Stock** : Notification automatique lorsque les réserves ou les budgets carburant atteignent un seuil critique.

### 🔧 Maintenance & Entretiens (Prédictif)
- **Carnet d'Entretien Numérique** : Historique complet des réparations et interventions.
- **Relances Automatiques** : Le système génère des alertes pour :
  - Les vidanges (basées sur le kilométrage paramétré).
  - Les visites techniques (basées sur les dates d'échéance).
  - Les renouvellements d'assurance.

### 💰 Budgets & Finances
- **Cockpit Financier** : Suivi des budgets globaux alloués à la maintenance et au carburant.
- **Analyse des Coûts** : Visualisation des dépenses mensuelles et par véhicule pour identifier les postes de dépenses excessifs.

---

## ⚙️ Automatismes du Système

Le système **Fleet Guardian** travaille pour vous en arrière-plan :
- **Calculateur de Seuil** : Analyse quotidiennement les dates et kilométrages pour prévenir les pannes.
- **Générateur de Rapports** : Exportation en un clic de toutes les données (Véhicules, Missions, Dépenses) au format **CSV** pour analyse externe.
- **Sécurité Multi-Rôles** : Gestion fine des accès (ROOT_ADMIN, ADMIN, GESTIONNAIRE) pour protéger les données stratégiques.

---

## 🚀 Déploiement & Installation

### 1️⃣ Pré-requis
- **MySQL** installé et configuré.
- **Node.js** (v18+) et **npm**.

### 2️⃣ Configuration de la Base de Données
Créez une base de données vide nommée `fleet_guardian` :
```sql
CREATE DATABASE fleet_guardian;
```

Mettez à jour le fichier `backend/.env` avec vos accès :
```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/fleet_guardian"
```

### 3️⃣ Initialisation du Système
Une fois la base créée, lancez les commandes suivantes dans le dossier `backend` :

```bash
# Installation des dépendances
npm install

# Création des tables
npx prisma db push

# INITIALISATION DES DONNÉES (SEED)
# Cette commande crée le compte ROOT_ADMIN et les données de démo
npm run prisma:seed
```

### 4️⃣ Lancement
- **Backend** : `npm start` (ou `npm run start:dev` pour le développement)
- **Frontend** : `npm run dev`

---

## 🔐 Accès par Défaut (Après Seed)

| Rôle | Identifiant (Username) | Mot de passe |
| :--- | :--- | :--- |
| **Super Admin** | `admin_fleet` | `Admin_123` |
| **Gestionnaire** | `gestionnaire` | `gest123` |

---

## 📄 Licence & Propriété
Logiciel sous licence propriétaire. Développé pour une utilisation enterprise white-label.

---
© 2026 FleetGuardian - Système de Gestion de Parc Automobile Universel.
| `gest123` |

---

## 📄 Licence & Propriété
Logiciel sous licence propriétaire. Développé pour une utilisation enterprise white-label.

---
© 2026 FleetGuardian - Système de Gestion de Parc Automobile Universel.