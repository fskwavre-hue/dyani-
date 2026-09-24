# Dyani Hospitality — refonte v2

**En ligne depuis le 24/09/2026.** Cette refonte est le site : elle a
remplacé l'habillage précédent à la racine (`/` et `/en/`). Ce document
garde la trace de ce qui a été corrigé, et de ce qui reste ouvert.

## État

Installée et configurée le 23/09/2026. Rien à renseigner : les
coordonnées et la clé Web3Forms sont déjà en place dans `v2.js`.

Deux pages : `/` (français) et `/en/` (anglais). Elles partagent
`v2.css`, `v2.js`, `v2-boot.js` et `fonts/`, à la racine du site ; le
script détecte la langue par `<html lang>`.

Testées en local dans les deux langues, en 1440 px et en 390 px :
aucune erreur JavaScript, aucune ressource manquante, aucune violation
de la politique de sécurité, aucun débordement horizontal, et **aucune
requête vers un domaine tiers**. L'envoi du formulaire a été validé de
bout en bout dans les deux langues, jusqu'à la réception de l'e-mail.

## Ajouts du 24/09/2026

- **« Les profils que je forme »** refait : la liste pilote un portrait
  circulaire cerclé d'un anneau de progression. L'anneau avance seul,
  se met en pause dès que le visiteur survole ou tabule dans la
  section, et ne tourne que lorsqu'elle est à l'écran. Navigation au
  clavier par les flèches, `Home` et `End` (motif « onglets »). Sans
  JavaScript, les six profils restent lisibles à la suite.
  La durée d'un profil se règle par `--dwell` dans `v2.css`.
- **Référence de demande** (`DH-AAMMJJ-XXXX`) engendrée à l'ouverture
  de la page. **Elle n'est pas montrée au visiteur** : elle ne part que
  dans l'objet de l'e-mail et dans un champ dédié, pour que le
  destinataire relie une réponse à sa demande sans que le formulaire
  s'alourdisse d'un numéro à l'écran. Le suffixe évite les caractères
  ambigus à l'oral (ni O/0, ni I/1, ni S/5, ni B/8).
- **Version anglaise** complète, reprenant les tournures déjà validées
  de `/en/`. Les libellés d'état, l'objet de l'e-mail et le message
  composé suivent la langue de la page.
- **Deux photographies dans « Pour qui »** : la section n'était faite
  que de pictogrammes. Une sonnette de réception en laiton pour les
  hôtels, un lobby à l'escalier hélicoïdal pour les cafés et concepts,
  toutes deux en cadre circulaire — le même motif que les profils, pour
  qu'il se lise comme un parti pris et non comme un accident.
  Le lobby reprend le traitement déjà validé pour la v1 (désaturé,
  recadré pour écarter un panneau de sortie en vietnamien et un scooter
  rouge) : sans cela, sa colorimétrie froide jurait avec la palette.
- **Relecture orthotypographique** (voir plus bas).

## Corrections apportées à la livraison d'origine

1. **Envoi du formulaire.** Le code livré postait en
   `Content-Type: application/json`, ce qui oblige le navigateur à une
   requête de vérification préalable (OPTIONS) que l'API de Web3Forms
   refuse : l'envoi aurait échoué à tous les coups. Repassé en
   `FormData`, comme `assets/js/main.js`. **Ne pas repasser en JSON.**
2. **Coordonnées.** Elles étaient à renseigner en clair dans le
   fichier. Reprises de `assets/js/main.js` sous forme encodée, pour
   qu'un aspirateur d'adresses qui lit la source ne trouve rien.
3. **Numéro affiché.** La mise en forme reposait sur un motif à douze
   chiffres, alors que le numéro en compte onze : il s'affichait brut.
   La forme lisible est désormais lue telle quelle.
4. **Champs de l'e-mail reçu.** Seuls le message et l'adresse étaient
   transmis. Le détail (nom, établissement, type, ville, effectif,
   domaine) est de nouveau envoyé en champs séparés, pour que la
   demande reste lisible d'un coup d'œil.
5. **Français du message généré.** « au sujet de un hôtel » →
   « au sujet d'un hôtel ». L'élision tient compte de l'initiale réelle,
   y compris pour un nom d'établissement saisi librement.
6. **Anti-robot.** La temporisation minimale avant envoi, présente sur
   le site actuel, avait disparu ; elle est rétablie en complément du
   champ-piège.
7. **Double envoi.** Le bouton se verrouille pendant la requête.
8. **États de l'envoi.** Succès et échec sont désormais distingués
   visuellement.
9. **Indexation.** La préversion est en `noindex` (voir ci-dessous).

## Relecture orthotypographique

Le texte livré était propre : apostrophes typographiques partout,
aucun guillemet droit, aucune faute d'orthographe relevée. Quatre
points corrigés malgré tout :

1. **Espaces insécables.** Treize endroits où une espace ordinaire
   précédait `:` `;` `?`, et six paires de guillemets dont les espaces
   intérieures étaient sécables. En français ces signes exigent une
   espace insécable, faute de quoi la ponctuation peut basculer seule
   en début de ligne. Le site actuel applique déjà cette règle.
2. **« Knokke-Heist, 2024 ».** Cette année n'apparaît nulle part sur
   le site actuel et rien ne la vérifie. Elle a été retirée plutôt que
   de publier une date invérifiable — **à rétablir si le client la
   confirme** (`v2/index.html` et `v2/en/index.html`, section
   « Étude de cas »).
3. **« FR · ع ».** La lettre arabe isolée était cryptique pour un
   lecteur francophone. Rétablie en « FR · AR », comme sur le site
   actuel. L'arabe reste écrit en toutes lettres plus bas.
4. **« Le constat » en double.** L'intitulé de section répétait le
   titre de la première étape juste en dessous. La section s'intitule
   désormais « Le point de départ ».

## Tester en local

Avec un petit serveur, pas en double-cliquant sur le fichier :

    npx serve .          # puis http://localhost:3000/
    # ou
    python -m http.server 8899

L'envoi du formulaire fonctionne depuis `localhost`. En revanche,
Web3Forms **refuse les navigateurs à signature « headless »** : un
test automatisé (Playwright, Puppeteer) doit passer un `user_agent`
de Chrome ordinaire, sans quoi la réponse revient sans en-tête CORS
et l'échec ressemble à tort à une clé invalide.

## Ce que la mise en ligne a demandé (fait le 24/09/2026)

1. `v2/index.html` et `v2/en/index.html` sont devenus `index.html` et
   `en/index.html` ; `v2.css`, `v2.js`, `v2-boot.js` et `fonts/` sont
   remontés à la racine.
2. Chemins repris : `../assets/` → `assets/` en français,
   `../../assets/` → `../assets/` en anglais.
3. Indexation rétablie : `noindex, nofollow` → `index, follow,
   max-image-preview:large`. Les `canonical` pointaient déjà juste.
4. Sélecteur de langue remis sur `/` et `/en/`.
5. `_headers` : les règles de cache `/v2/…` sont devenues des règles
   racine. `_redirects` : `/v2/*` et `/v2/en/*` redirigent en 301 vers
   les pages correspondantes, pour que les liens déjà partagés ne
   tombent pas en 404.
6. `assets/js/main.js` retiré : plus aucune page ne le chargeait.
   `assets/css/style.css` et `assets/fonts/` restent — les pages
   légales s'en servent encore.

## Reste à faire

- **Confirmer l'année du Constantin** (voir la relecture ci-dessus).

## Messagerie

Depuis le 24/09/2026, les demandes arrivent sur
`contact@dyanihospitality.com` (Zoho). La clé Web3Forms vit dans
`v2.js` (`CONFIG.web3formsKey`) et l'envoi a été vérifié, en français
comme en anglais, jusqu'à la réception de l'e-mail.

Une clé Web3Forms est publique par nature : elle n'autorise que le
dépôt d'un message vers la boîte qui lui est rattachée, jamais la
lecture de cette boîte.

## Contenu

- Aucune dépendance externe. Polices auto-hébergées (Cormorant Garamond
  + Manrope, licence OFL).
- Compatible avec la politique de sécurité (CSP) : aucun script ni
  style en ligne.
- Tout le texte d'origine est conservé, les passages longs sont repliés
  sous « En savoir plus ».
- Animations coupées si le visiteur a activé « réduire les animations ».
