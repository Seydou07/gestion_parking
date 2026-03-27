## Configuration de Production

### Backend (Railway)
- **URL** : `https://gestionparking-production.up.railway.app`
- **Port** : `3001`

### Frontend (Vercel)
- **URL** : `https://gestion-parking-7oui.vercel.app`

---

## Variables d'Environnement (Railway)
- `DATABASE_URL` : `${{MySQL.MYSQL_URL}}`
- `JWT_SECRET` : `${{gestion-flot2.1()}}`
- `JWT_EXPIRATION` : `24h`
- `NODE_ENV` : `production`
- `FRONTEND_URL` : `https://gestion-parking-7oui.vercel.app` (Lien final)

---

## Installation Locale
... (reste du readme à venir)