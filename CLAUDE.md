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

- `src/App.tsx` : routes (`/`, `/a-propos`, `/formations`, `/formations/:id`, `/inscription`, `/verification`, `/volontaires`, `/contact`).
- `src/pages/` : une page par route. `src/components/` : Header, Footer, Hero, Layout, ScrollToTop. Le contenu de `AboutPage` et `ContactPage` (textes du client) est en tête de fichier, sous forme de tableaux.
- `src/config/site.ts` : **nom, pays, slogan, adresse, horaires, téléphone, WhatsApp, e-mail, instructions de paiement**. Un champ à `null` n'est pas affiché (en-tête de page Contact, pied de page).
- `src/lib/data.ts` : **seul point d'accès aux données**. Les pages n'importent rien d'autre pour lire ou écrire.
- `src/lib/pricing.ts` : taux d'avance (`DEPOSIT_RATE`), pack BST (`BST_PACK`), calcul en centimes, format USD.
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
- Les montants stockés (`quote_total_usd`, `quote_deposit_usd`, `quote_discount_usd`) sont **indicatifs** : le personnel recalcule à partir des tarifs en vigueur. `quote_discount_usd` est optionnel dans les règles (compatibilité avec les anciennes pages ouvertes).
- **Tarifs** : liste fournie par le client le 2026-10-28, appliquée à 49 formations (`price_usd` dans `src/data/courses.ts`). **Pack complet BST** à 395 USD (1.13 + 1.19 + 1.20 + 1.21, soit 440 USD à l'unité) : remise automatique quand les quatre sont cochées, bouton « Ajouter le pack » sur la page Inscription. Le pack n'est pas une formation du catalogue.
- **Photo** : recadrée en 420×540 (35×45 mm) et compressée en JPEG dans le navigateur, stockée en base64 dans le document (champ `photo_data_url`). Choix fait pour rester sur la formule gratuite, car Cloud Storage exige la formule Blaze. À revoir si le volume augmente.
- **Sécurité** (`firestore.rules`) : le public peut **créer** un dossier (forme et tailles validées), jamais le lire, le modifier ni le supprimer. Tout le reste est fermé. Vérifié depuis l'extérieur : lecture, liste, modification, suppression et écriture hors schéma renvoient 403.
- Le personnel ne voit les dossiers que dans la console Firebase (Firestore > `registrations`). Il n'existe pas encore d'espace administrateur ni de notification par e-mail.
- Pas de paiement en ligne : l'écran de confirmation dit que les modalités seront communiquées par l'équipe, sauf si `SITE.paymentInstructions` est renseigné.
- Recommandé avant une large diffusion : activer **App Check** (anti-abus) sur Firestore.

## Données : état actuel

| Fonction (`src/lib/data.ts`) | État |
| --- | --- |
| `getCourses`, `getCourse` | Lisent `src/data/courses.ts` (statique) |
| `submitRegistration` (page Inscription) | **Branché sur Firestore** (`registrations`) |
| `submitContactMessage` (page Contact) | **Branché sur Firestore** (`contact_messages`, même principe : création seule, lecture par le personnel dans la console) |
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

- **Deux formations sans prix** : « Able Seafare Deck » et « Able Seafarer Engine » (`price_usd: null`, affichées « Prix à confirmer ») ne figurent pas dans la liste de prix du client : ce sont très probablement les doublons de « Rating as Able Seafarer for Deck / Engine » (450 USD). À retirer du catalogue si le client confirme. Attention : les textes « plus de 50 formations » (accueil, catalogue, À propos) deviendraient faux avec 49 formations.
- **Taux d'avance** : le client a dit « 45, voire 50 % ». `DEPOSIT_RATE` est à 0,5 dans `src/lib/pricing.ts`.
- **Liste des formations** : le fichier « heure STCW.txt » fourni par le client (51 lignes : n° IMO, nom, jours, heures) a été comparé au catalogue le 2026-10-28 : il est identique (seule différence : apostrophes `'` / `’`, alignées sur le client). Points laissés tels quels, à lui faire confirmer :
  - **Doublons probables** : « Rating as Able Seafarer for Deck / Engine » et « Able Seafare Deck / Able Seafarer Engine » ont la même durée (5 jours, 40 h) et la liste de prix du client ne reprend que les deux premiers (voir plus haut).
  - **Fautes dans les noms** : « Seafare » (Able Seafare Deck), « Seafares » (Security Training For Seafares…), « Assesor » (Train The Simulator And Assesor).
  - **Intitulés incohérents** : « Updating » (7.01, 7.03, 7.04) et « Upgrading » (7.02) pour des cours de la même série. Durées très longues (105 à 196 jours) pour ces cours, à vérifier.
- **Mode de paiement** de l'avance et du solde (virement, mobile money, carte...).
- **E-mail de contact** : le client a fourni `info@pmts.online`, mais **`pmts.online` appartient à un tiers** (enregistré le 2025-12-04, site actif). Son domaine est `p-mts.online` (avec tiret). Mettre `SITE.email` uniquement quand une boîte existe réellement (ex. `info@p-mts.online`, à créer : il faudra un service de messagerie).
- **Téléphone et WhatsApp** : valeurs fournies (`+507 000 000`, `+507 6000 0000`) invalides ou factices, donc `null` dans `src/config/site.ts`.
- **Page À propos** (texte fourni par le client, repris tel quel à de petites corrections typographiques près) : contient des affirmations à **faire documenter avant mise en ligne publique** : accréditation complète AMP en 2016, reconnaissance OPITO, 2 000 diplômés de 40 nationalités, fondation en 2014, noms, titres et parcours de 4 instructeurs, équipements (simulateurs, piscine, etc.). Le texte ressemble par endroits à un modèle générique (incohérence copyright 2011 / fondation 2014, coordonnées factices, mentions « Catégorie: » parasites retirées). Pour des certificats de sécurité maritime, une fausse accréditation est un risque juridique sérieux.
- **Chiffres de l'accueil** (50+ formations, 2 000 diplômés, 40+ nationalités, 2014) alignés sur la page À propos du client ; ils remplacent « 1200+ étudiants / 15 ans / 100 % certifiées » du prototype.
- **FAQ** (page Contact) : le client a fourni les questions sans réponses. Les réponses actuelles sont provisoires, rédigées à partir des informations déjà données (parcours d'inscription, plateforme en ligne) et renvoient vers le formulaire pour le reste. À faire valider ou remplacer, surtout : modes de paiement, délai d'obtention du certificat, reconnaissance internationale, réservations de groupe.
- **Pied de page** : la liste « Offshore & BOSIET » fournie par le client n'a **pas été reprise** : aucune formation offshore/BOSIET n'existe dans le catalogue de 51 cours.
- **Pages légales manquantes** : « Politique de confidentialité », « Conditions d'utilisation » et « Certifications » sont citées par le client mais n'existent pas. La politique de confidentialité est nécessaire dès maintenant puisque le site collecte des pièces d'identité et des photos.
- **Langue** : le site est en français ; le Panama est hispanophone, une version espagnole ou anglaise est peut-être attendue.

## Points connus

- Pas de dossier `public/` : le favicon `/vite.svg` référencé dans `index.html` n'existe pas (404). Pas de balises Open Graph.
- Les images des formations sont des liens directs vers Pexels (pas hébergées ici).
- Le titre du bandeau d'accueil « Advance Your Maritime Career » est en anglais.
- Sur la page Volontaires, les libellés du formulaire sont en `text-slate-700` sur fond sombre (faible contraste).
- `npm audit` : les alertes « production » viennent de `@grpc/grpc-js`, utilisé seulement par le build Node du SDK Firebase. Il n'est pas dans le code livré aux visiteurs (vérifié : aucune occurrence dans `dist/`). Ne pas lancer `npm audit fix --force` : il rétrograderait Firebase en version 9. Les autres alertes concernent les outils de développement.

## Travailler avec l'utilisateur

L'utilisateur fournit des captures d'écran d'un ancien site et relaie les demandes du client : s'en servir comme référence pour se rapprocher du résultat attendu. Échanger en français.
