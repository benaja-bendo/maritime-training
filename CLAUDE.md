# Panama Maritime Training Services (PMTS)

Site web d'une école de formation maritime du Panama (cours STCW / MLC), réalisé pour un client externe.
Interface **en français**. Le code (identifiants, types) est en anglais.

- Production : https://maritime-training-app.web.app (Firebase Hosting)
- Dépôt : https://github.com/benaja-bendo/maritime-training — **public**
- Projet Firebase : `maritime-training-app` (console : https://console.firebase.google.com/project/maritime-training-app), formule gratuite Spark
- Domaine personnalisé : pas encore acheté. Pistes du client : `p-mts.online` (libre d'après whois au 2026-10-28) ou `p-mts.pa` (règles du registre à confirmer)

## Stack

Vite 7 · React 18 · TypeScript · Tailwind CSS 3 · React Router 7 · lucide-react · Firebase (Hosting + Firestore).
Pas de tests automatisés pour le moment.

## Commandes

```bash
npm run dev         # serveur de développement
npm run typecheck   # tsc sans émission
npm run lint        # ESLint
npm run build       # build de production dans dist/
npm run deploy      # build + firebase deploy --only hosting
firebase deploy --only firestore:rules   # publier firestore.rules
```

Avant de livrer un changement : `typecheck`, `lint` et `build` doivent passer.

Mise en route sur un nouveau poste : `npm ci`, puis créer `.env` à partir de `.env.example`
(valeurs : `firebase apps:sdkconfig WEB 1:797540641529:web:ae1a42e0c039b951531028`). Sans `.env`,
le site fonctionne mais l'inscription répond « pas encore disponible ».

## Structure

- `src/App.tsx` : routes (`/`, `/formations`, `/formations/:id`, `/inscription`, `/verification`, `/volontaires`).
- `src/pages/` : une page par route. `src/components/` : Header, Footer, Hero, Layout, ScrollToTop.
- `src/config/site.ts` : **nom, pays, adresse, téléphone, e-mail, instructions de paiement**. Un champ à `null` n'est pas affiché.
- `src/lib/data.ts` : **seul point d'accès aux données**. Les pages n'importent rien d'autre pour lire ou écrire.
- `src/lib/pricing.ts` : taux d'avance (`DEPOSIT_RATE`), calcul en centimes, format USD.
- `src/lib/format.ts` : durées en français (virgule décimale, « 0,5 jour », « 13,25 h »). À utiliser pour tout affichage de durée.
- `src/lib/image.ts` : traitement de la photo d'identité. `src/lib/countries.ts` : liste des pays (français, Panama en tête).
- `src/lib/firebase.ts` : initialisation Firebase, chargée à la demande (import dynamique) pour ne pas alourdir les autres pages.
- `src/data/courses.ts` : catalogue de 51 formations.
- `src/types/index.ts` : modèles. `firestore.rules` : règles de sécurité Firestore.
- `src/index.css` : classes utilitaires du design (`container-app`, `btn-primary`, `btn-secondary`, `card`, `input-field`, `section-label`, `gold-rule`).

## Conventions

- Importer avec l'alias `@/` (= `src/`), pas de chemins relatifs profonds.
- Icônes : `lucide-react` uniquement. Ne pas ajouter de dépendance UI sans raison.
- Style : Tailwind + les classes de `src/index.css`. Palette : fond `#0b1b30`, bandeaux `#172f4e`, bordures `#294769`, accent or `#e1b936` (hover `#f0cc58`). Sur fond sombre, libellés en `text-slate-200`.
- Dans le texte JSX, écrire les apostrophes typographiques directement (`’`). La séquence d'échappement unicode n'y est **pas** interprétée et s'afficherait telle quelle (bug déjà corrigé une fois).
- Messages d'erreur côté utilisateur en français. Monnaie : dollar américain (USD), devise du Panama.
- Le nom de l'organisme vient de `SITE.name`, sauf dans l'en-tête et le pied de page où il est écrit sur deux lignes.

## Inscription en ligne (`/inscription`)

Parcours voulu par le client : le candidat remplit le formulaire (nom, prénoms, e-mail, nationalité, CNI **ou** passeport + numéro, photo d'identité, choix des formations). Le prix de chaque formation s'affiche à la sélection, avec le total, l'**avance** (`DEPOSIT_RATE`) et le **solde**. L'inscription n'est finalisée qu'après paiement de l'avance ; le solde est payé après la formation, pour recevoir les documents.

- `submitRegistration` crée un document `registrations/PMTS-XXXXXXXX` (référence aléatoire, affichée au candidat) avec `status: 'pending_deposit'`.
- Les montants stockés (`quote_*`) sont **indicatifs** : le personnel recalcule à partir des tarifs en vigueur.
- **Photo** : recadrée en 420×540 (35×45 mm) et compressée en JPEG dans le navigateur, stockée en base64 dans le document (champ `photo_data_url`). Choix fait pour rester sur la formule gratuite, car Cloud Storage exige la formule Blaze. À revoir si le volume augmente.
- **Sécurité** (`firestore.rules`) : le public peut **créer** un dossier (forme et tailles validées), jamais le lire, le modifier ni le supprimer. Tout le reste est fermé. Vérifié depuis l'extérieur : lecture, liste, modification, suppression et écriture hors schéma renvoient 403.
- Le personnel ne voit les dossiers que dans la console Firebase (Firestore > `registrations`). Il n'existe pas encore d'espace administrateur ni de notification par e-mail.
- Pas de paiement en ligne : l'écran de confirmation dit que les modalités seront communiquées par l'équipe, sauf si `SITE.paymentInstructions` est renseigné.
- Recommandé avant une large diffusion : activer **App Check** (anti-abus) sur Firestore.

## Données : état actuel

| Fonction (`src/lib/data.ts`) | État |
| --- | --- |
| `getCourses`, `getCourse` | Lisent `src/data/courses.ts` (statique) |
| `submitRegistration` (page Inscription) | **Branché sur Firestore** |
| `findStudentByCode` (page Vérification) | Lève `ServiceUnavailableError` : pas encore branché |
| `submitVolunteer` (page Volontaires) | Lève `ServiceUnavailableError` : pas encore branché |

Les deux dernières affichent volontairement « pas encore disponible ». Ne pas les faire répondre « introuvable » ou « envoyé » sans backend : sur un portail de vérification de certificats, ce serait trompeur. Pour les brancher : remplacer le corps de la fonction (signature et pages inchangées) et ajouter la collection correspondante dans `firestore.rules`.

## Dépôt public : règles strictes

- Aucun secret ni fichier `.env` dans git (seul `.env.example` est versionné).
- **Jamais de données personnelles réelles** (noms, dates de naissance, photos, numéros de pièce d'identité, e-mails) dans le dépôt, y compris en jeu de test. Elles vivent uniquement dans Firestore.
- Un test de bout en bout écrit dans la vraie base : utiliser des données manifestement fictives et **supprimer le dossier de test** ensuite (`firebase firestore:delete /registrations/<REF> --force`, puis vérifier dans la console, la commande est silencieuse).
- Les clés web Firebase ne sont pas des secrets : la protection des données repose sur les règles Firestore. Toute modification de `firestore.rules` doit être testée depuis l'extérieur avant publication.

## Déploiement

Le CLI Firebase est installé et connecté sur le poste du développeur. `firebase.json` envoie toutes les URL vers `index.html` (routage côté client) et met en cache long les fichiers de `/assets`. `npm run deploy` ne publie que Hosting : les règles Firestore se publient à part.

## À confirmer avec le client

- **Tarifs** : `price_usd` vaut `null` pour les 51 formations (affiché « Prix à confirmer »). Dès réception de la liste, les renseigner dans `src/data/courses.ts`.
- **Taux d'avance** : le client a dit « 45, voire 50 % ». `DEPOSIT_RATE` est à 0,5 dans `src/lib/pricing.ts`.
- **Liste des formations** : le fichier « heure STCW.txt » fourni par le client (51 lignes : n° IMO, nom, jours, heures) a été comparé au catalogue le 2026-10-28 : il est identique (seule différence : apostrophes `'` / `’`, alignées sur le client). Points laissés tels quels, à lui faire confirmer :
  - **Doublons probables** : « Rating as Able Seafarer for Deck / Engine » et « Able Seafare Deck / Able Seafarer Engine » ont la même durée (5 jours, 40 h). Deux cours identiques côté candidat, avec deux tarifs à fixer.
  - **Fautes dans les noms** : « Seafare » (Able Seafare Deck), « Seafares » (Security Training For Seafares…), « Assesor » (Train The Simulator And Assesor).
  - **Intitulés incohérents** : « Updating » (7.01, 7.03, 7.04) et « Upgrading » (7.02) pour des cours de la même série. Durées très longues (105 à 196 jours) pour ces cours, à vérifier.
- **Mode de paiement** de l'avance et du solde (virement, mobile money, carte...).
- **Coordonnées** (adresse, téléphone, e-mail) : à saisir dans `src/config/site.ts`. Les anciennes valeurs (Marseille, +33) étaient factices et ont été retirées.
- **Références panaméennes** : agrément éventuel de l'Autorité maritime du Panama (AMP), numéro d'autorisation. Ne rien affirmer sans document du client.
- **Chiffres du site** (« 1200+ étudiants », « 15 ans d'expérience », « 100 % certifiées ») hérités du prototype, non vérifiés.
- **Langue** : le site est en français ; le Panama est hispanophone, une version espagnole ou anglaise est peut-être attendue.

## Points connus

- Pas de dossier `public/` : le favicon `/vite.svg` référencé dans `index.html` n'existe pas (404). Pas de balises Open Graph.
- Les images des formations sont des liens directs vers Pexels (pas hébergées ici).
- Le titre du bandeau d'accueil « Advance Your Maritime Career » est en anglais.
- Sur la page Volontaires, les libellés du formulaire sont en `text-slate-700` sur fond sombre (faible contraste).
- `npm audit` : les alertes « production » viennent de `@grpc/grpc-js`, utilisé seulement par le build Node du SDK Firebase. Il n'est pas dans le code livré aux visiteurs (vérifié : aucune occurrence dans `dist/`). Ne pas lancer `npm audit fix --force` : il rétrograderait Firebase en version 9. Les autres alertes concernent les outils de développement.

## Travailler avec l'utilisateur

L'utilisateur fournit des captures d'écran d'un ancien site et relaie les demandes du client : s'en servir comme référence pour se rapprocher du résultat attendu. Échanger en français.
