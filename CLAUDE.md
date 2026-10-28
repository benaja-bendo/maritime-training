# Maritime Training

Site web d'un centre de formation maritime (cours STCW / MLC), réalisé pour un client externe.
Interface **en français**. Le code (identifiants, types) est en anglais.

- Production : https://maritime-training-app.web.app (Firebase Hosting)
- Dépôt : https://github.com/benaja-bendo/maritime-training — **public**
- Projet Firebase : `maritime-training-app` (console : https://console.firebase.google.com/project/maritime-training-app)

## Stack

Vite 7 · React 18 · TypeScript · Tailwind CSS 3 · React Router 7 · lucide-react.
Pas de tests automatisés pour le moment.

## Commandes

```bash
npm run dev         # serveur de développement
npm run typecheck   # tsc sans émission
npm run lint        # ESLint
npm run build       # build de production dans dist/
npm run deploy      # build + firebase deploy --only hosting
```

Avant de livrer un changement : `typecheck`, `lint` et `build` doivent passer (état actuel : tous verts).

## Structure

- `src/App.tsx` : routes (`/`, `/formations`, `/formations/:id`, `/verification`, `/volontaires`).
- `src/pages/` : une page par route. `src/components/` : Header, Footer, Hero, Layout, ScrollToTop.
- `src/lib/data.ts` : **seul point d'accès aux données**. Les pages n'importent rien d'autre pour lire ou écrire.
- `src/data/courses.ts` : catalogue de 51 formations.
- `src/types/index.ts` : modèles (`Course`, `Student`, `StudentCourse`, `Volunteer`, ...).
- `src/index.css` : classes utilitaires du design (`container-app`, `btn-primary`, `btn-secondary`, `card`, `input-field`, `section-label`, `gold-rule`).

## Conventions

- Importer avec l'alias `@/` (= `src/`), pas de chemins relatifs profonds.
- Icônes : `lucide-react` uniquement. Ne pas ajouter de dépendance UI sans raison.
- Style : Tailwind + les classes de `src/index.css`. Palette : fond `#0b1b30`, bandeaux `#172f4e`, bordures `#294769`, accent or `#e1b936` (hover `#f0cc58`).
- Dans le texte JSX, écrire les apostrophes typographiques directement (`’`). La séquence d'échappement unicode n'y est **pas** interprétée et s'afficherait telle quelle (bug déjà corrigé une fois).
- Messages d'erreur côté utilisateur en français.

## Données : état actuel et cible

Le projet est parti d'un prototype dont l'ancienne base de données a été entièrement retirée. La base cible est **Firebase (Firestore)**.

| Fonction (`src/lib/data.ts`) | État |
| --- | --- |
| `getCourses`, `getCourse` | Lisent `src/data/courses.ts` (statique) |
| `findStudentByCode` (page Vérification) | Lève `ServiceUnavailableError` : **pas encore branché** |
| `submitVolunteer` (page Volontaires) | Lève `ServiceUnavailableError` : **pas encore branché** |

Les deux dernières affichent volontairement « pas encore disponible ». Ne pas les faire répondre « introuvable » ou « envoyé » sans backend : sur un portail de vérification de certificats, ce serait trompeur.

Pour brancher Firestore : remplacer le corps des fonctions de `src/lib/data.ts` (les signatures et les pages ne changent pas), ajouter le SDK `firebase`, la config dans `.env` (variables `VITE_FIREBASE_*`, fichier `.env.example` à créer) et écrire les règles de sécurité Firestore.

## Dépôt public : règles strictes

- Aucun secret ni fichier `.env` dans git (`.gitignore` les exclut, seul `.env.example` est versionné).
- **Jamais de données personnelles d'élèves** (noms, dates de naissance, photos, numéros de certificat) dans le dépôt, y compris en jeu de test. Elles doivent vivre uniquement dans Firestore.
- Les clés web Firebase ne sont pas des secrets, mais la protection des données repose alors entièrement sur les règles Firestore : à écrire et à tester avant d'ouvrir la vérification au public.

## Déploiement

Le CLI Firebase est installé et connecté sur le poste du développeur. `firebase.json` envoie toutes les URL vers `index.html` (routage côté client) et met en cache long les fichiers de `/assets`.

```bash
npm run deploy
```

## Points connus à traiter

- Pas de dossier `public/` : le favicon `/vite.svg` référencé dans `index.html` n'existe pas (404).
- `index.html` : `lang="en"` et titre générique « Maritime Training Web App » alors que le site est en français ; pas de balises Open Graph.
- Les images des formations sont des liens directs vers Pexels (pas hébergées ici).
- `npm audit` : 13 alertes, toutes dans les outils de développement (0 en production).

## Travailler avec l'utilisateur

L'utilisateur fournira des captures d'écran d'un ancien site : s'en servir comme référence visuelle pour se rapprocher du résultat final attendu par le client. Échanger en français.
