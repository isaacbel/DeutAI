# DeutAI — Système 404 | Backend

API REST Node.js + Express + PostgreSQL + Claude API pour le système de correction grammaticale allemand.

---

## Démarrage rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos vraies valeurs
```

### 3. Initialiser la base de données
```bash
# Créer la base de données PostgreSQL
createdb deutai

# Exécuter le schéma
psql $DATABASE_URL -f db/schema.sql
```

### 4. Démarrer le serveur
```bash
# Production
npm start

# Développement (avec hot reload)
npm run dev
```

---

## Variables d'environnement

| Variable             | Description                               |
|----------------------|-------------------------------------------|
| `PORT`               | Port du serveur (défaut : 3001)           |
| `DATABASE_URL`       | URL de connexion PostgreSQL               |
| `DATABASE_SSL`       | `0` pour desactiver SSL en local seulement |
| `PG_POOL_MAX`        | Taille max du pool PostgreSQL (defaut 10) |
| `JWT_SECRET`         | Secret pour les access tokens (min 32c)  |
| `JWT_REFRESH_SECRET` | Secret pour les refresh tokens (min 32c) |
| `JWT_ACCESS_EXPIRES_IN` | Duree access token (defaut `15m`)      |
| `JWT_REFRESH_EXPIRES_IN` | Duree refresh token (defaut `7d`)    |
| `BCRYPT_SALT_ROUNDS` | Rounds bcrypt (defaut 10)                 |
| `ANTHROPIC_API_KEY`  | Clé API Anthropic                         |
| `EMAIL_HOST`         | Hôte SMTP pour les emails                 |
| `EMAIL_PORT`         | Port SMTP (587 recommandé)                |
| `EMAIL_USER`         | Utilisateur SMTP                          |
| `EMAIL_PASS`         | Mot de passe SMTP                         |
| `EMAIL_FROM`         | Expéditeur affiché                        |
| `FRONTEND_URL`       | URL du frontend (pour CORS + reset links) |

---

## Endpoints API

### Auth (public)
| Méthode | Route                    | Description                    |
|---------|--------------------------|--------------------------------|
| POST    | /auth/register           | Inscription                    |
| POST    | /auth/login              | Connexion                      |
| POST    | /auth/refresh            | Rafraîchir l'access token      |
| POST    | /auth/forgot-password    | Demander un reset de mot de passe |
| POST    | /auth/reset-password     | Réinitialiser le mot de passe  |

### Analyse (JWT requis)
| Méthode | Route                    | Description                    |
|---------|--------------------------|--------------------------------|
| POST    | /analyze                 | Analyser une phrase en allemand |
| POST    | /notebook/ocr            | OCR d'une photo manuscrite     |
| POST    | /notebook/analyze        | Analyser le texte confirmé     |

### Flashcards (JWT requis)
| Méthode | Route                    | Description                    |
|---------|--------------------------|--------------------------------|
| GET     | /flashcards              | Lister ses flashcards          |
| DELETE  | /flashcards/:id          | Supprimer une flashcard        |

### Stats & Unités (JWT requis)
| Méthode | Route                    | Description                    |
|---------|--------------------------|--------------------------------|
| GET     | /stats                   | Statistiques d'erreurs         |
| GET     | /units/:qrCode           | Résoudre un QR code            |

### Ping (public)
| Méthode | Route                    | Description                    |
|---------|--------------------------|--------------------------------|
| GET     | /ping                    | Vérifier que le serveur est prêt |

---

## Déploiement sur Render.com

1. Connecter le dépôt GitHub sur Render
2. Type de service : **Web Service**
3. Build command : `npm install`
4. Start command : `npm start`
5. Ajouter toutes les variables d'environnement dans le dashboard Render
6. Ajouter une base de données PostgreSQL sur Render et copier l'URL dans `DATABASE_URL`
7. Verifier que la base accepte les connexions externes depuis Render (Render DB, Supabase/Atlas allowlist `0.0.0.0/0` ou IP sortantes Render)
8. Exécuter le schéma SQL via la console Render ou pgAdmin

Le serveur valide les variables critiques au demarrage, teste `DATABASE_URL` avant `app.listen`, puis ecoute toujours `process.env.PORT` quand Render l'injecte.
