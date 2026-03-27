# CCVA Fleet Management (Gestion de Parking)

## Configuration de Production (Railway)

- **Backend URL** : `https://gestionparking-production.up.railway.app`
- **Port cible (Target Port)** : `3001`
- **Variables d'environnement** :

- `JWT_SECRET` : `${{gestion-flot2.1()}}`
- `JWT_EXPIRATION` : `24h`
- `NODE_ENV` : `production`
- `DATABASE_URL` : `${{MySQL.MYSQL_URL}}` (Référence interne)

---

## Installation Locale
... (reste du readme à venir)