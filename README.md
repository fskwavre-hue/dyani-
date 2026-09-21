# Dyani Hospitality — site vitrine

Site statique bilingue (français / anglais) pour Dyani Hospitality :
formation des équipes, standards de service et organisation opérationnelle
pour l'hôtellerie et la restauration au Maroc.

Aucune dépendance, aucun outil de compilation. Ce sont des fichiers HTML,
CSS et JavaScript que l'on dépose tels quels chez n'importe quel hébergeur.

---

## Arborescence

```
.
├── index.html              page française (racine du site)
├── en/index.html           page anglaise
├── legal/index.html        mentions légales et confidentialité (FR)
├── en/legal/index.html     mentions légales et confidentialité (EN)
├── favicon.ico
├── robots.txt              règles d'indexation et blocage des aspirateurs
├── sitemap.xml             plan du site, avec les correspondances FR/EN
├── _headers                en-têtes de sécurité et de cache — Netlify
├── _redirects              masque ce README au public — Netlify
├── assets/
│   ├── css/style.css       feuille de styles unique
│   ├── js/main.js          script unique
│   ├── img/                photographies, icônes, image de partage
│   └── video/              séquence filmée
└── src vid et photo/       ORIGINAUX fournis par le client (voir plus bas)
```

---

## Mettre le site en ligne

Le site est hébergé chez **Netlify**, qui publie automatiquement la
branche `main` du dépôt GitHub : un push suffit, la mise en ligne suit en
moins d'une minute. Netlify lit `_headers` (sécurité, cache) et
`_redirects` (règles de redirection).

Le domaine officiel est `https://dyanihospitality.com`, sans `www` —
l'adresse avec `www` y redirige. C'est lui qui figure dans les balises
`canonical`, `og:url`, `hreflang` et dans `sitemap.xml`.

**Cache.** Le CSS et le JS sont revérifiés à chaque visite (réponse 304
s'ils n'ont pas changé) : une modification est visible immédiatement. Les
images, elles, sont gardées un an : pour remplacer une image, lui donner
un **nouveau nom**, sinon les visiteurs déjà venus garderont l'ancienne.

**Changer d'hébergeur.** `_headers` et `_redirects` sont propres à
Netlify. Chez un autre hébergeur, reporter leurs règles dans son format
(`vercel.json` pour Vercel, `.htaccess` pour Apache).

---

## Identité visuelle

| | |
| --- | --- |
| Titres | **Bricolage Grotesque** — 400 à 700, chasse serrée |
| Textes | **Manrope** — 300 à 700 |
| Fond clair | `#F6F5F2` os, `#EBE8E1` lin |
| Surfaces sombres | `#1C1E24` graphite, `#131419` graphite profond |
| Accent | `#A8823F` laiton, `#C9A96B` laiton clair |
| Motif | cadre à angles adoucis doublé d'un contour laiton décalé ; trame de points sur les sections sombres |
| Logo | `assets/img/logo.*` (fonds clairs) et `logo-light.*` (fonds sombres) ; favicons dans `favicon.ico` et `assets/img/favicon-*` |

Le logo est fourni en un seul fichier horizontal. Les variantes claires,
la marque isolée, les favicons et l'image de partage en sont dérivés —
pour les régénérer après un changement de logo, repartir de
`src vid et photo/DYANI_logo_horizontal.png`.

Tout est piloté par les variables du bloc `:root`, en tête de
`assets/css/style.css`. **Changer une valeur là re-habille tout le site** —
il n'y a pas de couleur ni de police écrite en dur ailleurs.

---

## Modifier le contenu

### Texte

Les textes sont directement dans `index.html` (français) et
`en/index.html` (anglais). **Toute modification doit être reportée
dans les deux fichiers**, sans quoi les versions divergent.

### Coordonnées — e-mail et WhatsApp

Elles ne figurent **nulle part en clair**, ni dans le HTML ni dans le
JavaScript : un robot collecteur d'adresses qui lit la source ne trouve
rien. Elles sont encodées en base64 et reconstituées par le navigateur.

Pour les changer, ouvrir la console du navigateur (F12), exécuter :

```js
btoa('nouvelle-valeur')
```

puis reporter le résultat dans `assets/js/main.js`, objet `_c` :

| Clé  | Contenu |
| --- | --- |
| `_e` | adresse e-mail |
| `_w` | numéro WhatsApp, format international, sans `+` ni espace |
| `_t` | numéro tel qu'il doit s'afficher, lisible |

### Formulaire de contact — recevoir les messages

Le bouton **Envoyer par e-mail** ne passe plus par le logiciel de
messagerie du visiteur : le message part directement vers une boîte
e-mail, via le service [Web3Forms](https://web3forms.com). Le visiteur ne
quitte pas la page et voit une confirmation sous les boutons.

**Mise en service — une seule valeur à renseigner :**

1. aller sur [web3forms.com](https://web3forms.com), saisir l'adresse qui
   doit recevoir les demandes, valider ;
2. la clé d'accès (*Access Key*) arrive par e-mail — il faut confirmer
   ce premier message pour activer la boîte ;
3. la coller dans `assets/js/main.js`, objet `W3F` :

```js
var W3F = {
  cle: 'c2899e1d-f84a-48d1-9825-bbd1d207f7ec',
  url: 'https://api.web3forms.com/submit'
};
```

**État actuel — adresse affichée et boîte de réception sont
volontairement dissociées :**

| | |
| --- | --- |
| Adresse **affichée** sur le site | `contact@dyanihospitality.com` (objet `_c._e`) |
| Boîte qui **reçoit** les demandes | la boîte personnelle liée à la clé Web3Forms |

C'est l'intérêt du procédé : le visiteur ne voit que l'adresse
professionnelle, et les demandes arrivent où l'on veut, sans attendre que
la messagerie du domaine soit en service. Envoi vérifié en conditions
réelles (réponse `success: true` de l'API).

Pour faire arriver les demandes sur `contact@dyanihospitality.com` le
jour où cette boîte fonctionnera, créer une clé avec cette adresse et la
remplacer ci-dessus. Rien d'autre à toucher.

Pour changer de boîte plus tard (passage à
`contact@dyanihospitality.com`), refaire l'opération avec la nouvelle
adresse et remplacer la clé : rien d'autre à toucher.

Cette clé est **publique par nature** — elle figure dans le JavaScript,
comme sur tous les sites qui utilisent ce service. Elle n'autorise que le
dépôt d'un message ; elle ne donne aucun accès à la boîte e-mail.

**Tant que `cle` reste vide**, le bouton retombe sur l'ancien
comportement (ouverture du logiciel de messagerie du visiteur) : le site
reste donc utilisable même sans clé.

Points à connaître :

- l'offre gratuite de Web3Forms est plafonnée à **250 envois par mois**,
  largement suffisant ici ;
- l'adresse e-mail du visiteur est le **seul champ obligatoire** : sans
  elle, impossible de répondre. Tous les autres restent facultatifs ;
- le message reçu est rédigé **dans la langue de la page** consultée, et
  comporte en plus les champs détaillés (nom, établissement, ville,
  effectif, domaine) pour un tri rapide ;
- l'adresse `api.web3forms.com` est déclarée dans la politique de
  sécurité du contenu (`connect-src`) des deux pages d'accueil. Si le
  prestataire change, cette ligne doit changer aussi, sinon le navigateur
  bloque l'envoi ;
- **l'envoi se fait en `FormData`, jamais en JSON.** Ce n'est pas un
  choix de style : avec un en-tête `Content-Type: application/json`, le
  navigateur lance d'abord une requête de vérification `OPTIONS`, que
  l'API de Web3Forms refuse par un `403`. L'envoi échouerait alors
  systématiquement, avec une erreur CORS en console. `FormData` et
  l'en-tête `Accept` sont autorisés d'office et ne déclenchent aucune
  vérification préalable. La documentation de Web3Forms montre pourtant
  l'appel en JSON : ne pas s'y fier ;
- le bouton **WhatsApp** est inchangé : il ouvre l'application du
  visiteur avec le message pré-rédigé.

### Photographies

Remplacer les fichiers dans `assets/img/` en conservant les noms.
Chaque image existe en deux formats : `.webp` (servi en priorité, plus
léger) et `.jpg` (repli). Fournir les deux, au format portrait 3:4.

### Méthode — les sept temps

Les sept étapes se lisent d'un seul tenant, sur deux colonnes remplies
en colonne d'abord (01 à 04, puis 05 à 07), reliées par un filet vertical.
Aucun script : c'est une simple liste ordonnée (`<ol class="steps">`), donc
tout le contenu est visible d'emblée, indexable et imprimable. Sous 860 px
la liste repasse sur une seule colonne.

Le carrousel horizontal qui occupait cette place a été retiré : il cachait
six étapes sur sept derrière une manipulation, alors que l'intérêt de la
méthode tient justement à son enchaînement.

Pour ajouter ou retirer une étape : dupliquer un bloc `<li class="steps__i">`
dans les deux pages et renuméroter. Le filet et les pastilles suivent seuls.

### Étude de cas — Le Constantin

La section `#constantin` raconte une ouverture complète : un diptyque
chantier / salle dressée, le périmètre de la mission en liste, une galerie
de quatre vues, puis ce qui reste une fois le projet transmis.

Les photographies sont dans `assets/img/`, nommées `constantin-01` à
`constantin-07`, chacune en `.webp` et `.jpg`. Les originaux se trouvent
dans `src vid et photo/temoinage/`. Pour en changer : conserver les noms,
fournir les deux formats, et vérifier le cadrage — les vues sont recadrées
en 3/2 pour le diptyque, 3/4 pour la galerie et 2/3 pour le portrait final.

Chaque vue s'ouvre en plein écran au clic, ou au clavier avec Entrée. Les
flèches font défiler les sept vues de l'étude de cas sans passer à celles
de « Sur le terrain » : les deux séries sont indépendantes. Pour ajouter une
vue à la série, il suffit de l'insérer dans la section sous forme de
`<figure>` — le script la prend en compte seul.

### Vidéo

`assets/video/formation-terrain.mp4`. Elle n'est téléchargée qu'au clic
du visiteur : la page reste légère pour ceux qui ne la regardent pas.
Sa légende se trouve dans la section « Sur le terrain », balise
`<figcaption class="vframe__cap">`.

**Avant de remplacer ce fichier, vérifier qu'il est en « faststart ».**
Le fichier livré avait son index (atome `moov`) placé à la fin : le
navigateur devait alors télécharger les 5,7 Mo entiers avant de pouvoir
afficher la première image — chez chaque visiteur. L'index a été déplacé
en tête et les 2 050 offsets de morceaux corrigés en conséquence.

Pour refaire l'opération sur une nouvelle vidéo :

```sh
ffmpeg -i source.mp4 -c copy -movflags +faststart assets/video/formation-terrain.mp4
```

Pour contrôler l'ordre des atomes sans ffmpeg, `moov` doit apparaître
**avant** `mdat` dans les premiers octets du fichier.

### Barre de navigation et menu

La barre est une pilule avec un indicateur qui glisse sous le lien
survolé et revient au lien actif. Les positions sont mesurées à
l'exécution : changer un libellé ou de langue ne casse rien.

En dessous de 1150 px, la barre laisse place à un bouton « Menu » qui
ouvre un panneau déroulant. Son fond est **volontairement opaque** :
un panneau translucide dépend du compositing du navigateur et devient
illisible en rendu logiciel.

---

## Protections mises en place

| Mesure | Ce qu'elle empêche |
| --- | --- |
| Coordonnées encodées en base64 | La collecte automatique d'adresses e-mail et de numéros dans la source |
| Liens d'envoi inertes au repos | Aucune URL `mailto:` ou `wa.me` exploitable n'existe dans le DOM tant que le visiteur n'a pas cliqué |
| Envoi du formulaire relayé par Web3Forms | Aucune adresse de réception n'apparaît dans la page : le message est déposé chez le prestataire, qui seul connaît la boîte de destination |
| Champ-piège (honeypot) | Les robots remplissent un champ invisible ; l'envoi est alors refusé |
| Délai minimal de 3 secondes | Un envoi déclenché immédiatement après le chargement vient d'un script, pas d'une personne |
| `robots.txt` | L'aspiration du contenu par GPTBot, ClaudeBot, CCBot, Bytespider et une vingtaine d'autres extracteurs |
| Politique de sécurité du contenu | L'exécution de tout script injecté par un tiers |
| `X-Frame-Options` + `frame-ancestors` | L'affichage du site dans une iframe étrangère (détournement de clic) |
| `Permissions-Policy` | L'accès à la position, au micro et à la caméra |
| `object-src 'none'` dans la politique de contenu | Le chargement de tout plugin (`<object>`, `<embed>`), qui héritait sinon de l'origine du site |
| Règle de `_redirects` | La lecture publique de `README.md`, document de maintenance interne |

Le site ne comporte aucun serveur applicatif, aucun cookie et aucun
traceur : il n'y a pas de base de données à protéger ni de consentement à
recueillir. L'envoi du formulaire est la seule transmission de données —
elle est volontaire, déclenchée par un clic, et décrite dans les
mentions légales (`/legal/`, section 4).

---

## Points restés ouverts

- **Légende de la vidéo** — « Extrait filmé pendant une session, en
  établissement ». Volontairement neutre : à préciser par le client selon
  ce que montre réellement la séquence.
- **Messagerie du domaine `contact@dyanihospitality.com`** — le site
  affiche cette adresse partout, et le formulaire fonctionne sans elle
  (les demandes partent vers la boîte liée à la clé Web3Forms). Mais
  l'adresse est aussi proposée en lien `mailto:` dans le bloc
  « Coordonnées » : un visiteur qui choisit d'écrire directement, plutôt
  que d'utiliser le formulaire, écrit dans le vide tant que la
  redirection n'est pas en place. À configurer chez le registrar ou
  l'hébergeur du domaine (redirection d'alias vers la boîte souhaitée) —
  c'est la dernière pièce manquante côté contact.
- **Adresse d'expédition des réponses** — répondre à une demande depuis
  la boîte personnelle fait partir la réponse depuis celle-ci, et non
  depuis `contact@dyanihospitality.com`. Une fois l'adresse pro en
  service, la déclarer comme adresse d'envoi dans le client de
  messagerie pour que les réponses portent le nom du domaine.
- **Numéro WhatsApp** — le numéro est belge (`+32`) alors que le site
  s'adresse au marché marocain. À confirmer ou à remplacer.
- **Mentions légales** — la page `/legal/` existe et la partie
  confidentialité est complète : elle ne dépend que du fonctionnement du
  site (aucun cookie, aucun traqueur, aucun formulaire serveur). Deux
  encadrés restent à renseigner, signalés en pointillés sur la page :
  l'identification de l'éditeur (qui dépend du statut juridique retenu —
  société ou auto-entrepreneur) et le nom de l'hébergeur.
- **Colonne « Informations » du pied de page** — retirée à votre
  demande. Les pages `/legal/` et `/en/legal/` existent toujours et
  restent accessibles par URL ; un bloc commenté dans le pied indique
  où les relier quand vous le souhaiterez.
- **Vidéo — marque RLM Service** — la séquence porte à l'écran le
  logo et le nom de RLM Service, pas ceux de Dyani Hospitality. À
  arbitrer : cela prouve l'activité réelle, mais peut dérouter un
  visiteur sur un site Dyani.
- **Dossier `src vid et photo/`** — les fichiers d'origine fournis par le
  client. Ils sont conservés comme archive ; ils ne sont pas utilisés par
  le site et peuvent être exclus du déploiement.

---

## Vérifications effectuées

Les deux langues ont été chargées dans un navigateur réel : aucune erreur
de console, aucune ressource manquante, aucun débordement horizontal à
390 px de large. Visionneuse, lecture vidéo, champ-piège et délai
anti-robot testés et fonctionnels. La méthode, l'étude de cas et les
cartes d'intervention ont été contrôlées à 390, 1160 et 1440 px :
alignement des numéros, barre de navigation sur une seule ligne et
aucun débordement. Les quatre pages — accueil et mentions légales, dans les deux
langues — se chargent sans erreur.
