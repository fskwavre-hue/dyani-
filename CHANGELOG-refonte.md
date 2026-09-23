# Refonte 2026 — journal

Modernisation du site (FR + `/en/`) : moins de texte, plus de schémas,
animations sobres. Zéro dépendance ajoutée — CSS moderne et JS natif.

Ordre de travail : menu + header → hero + chiffres → intro → interventions →
méthode → terrain → formations → établissements/profils → étude de cas →
fondateur/recommandation → langues → contact → footer.

---

## Préalables

**Mise à plat du dépôt.** Six chantiers en cours ont été committés
séparément pour rester révertables un par un : écu belge, refonte Méthode,
retrait du parcours du fondateur, icônes des profils, ligne des
établissements, dépliage des formations.

**Relecture orthotypographique** (FR + EN). 21 espaces insécables, apostrophe
typographique `’` sur 156 occurrences, `adressez-le-nous`, deux `aria-label`
restés en français dans `/en/`, un pronoms anglais incohérent. Aucune faute
d'orthographe ni d'accord n'avait été trouvée.

**Palette.** Les 8 occurrences de `#16232E` par page (palette abandonnée) sont
remplacées : `theme-color` en `--navy`, les quatre icônes inline en
`currentColor` avec `color:var(--ink)` porté par leur pastille.

**Repère « 15 ans ».** Devenu « Depuis 2010 » / « Since 2010 » : le chiffre
était faux (2010 → 2026 fait seize ans) et l'étape suivante devait en faire un
compteur animé. Formulation non numérique en attendant confirmation.

---

## 1. Menu + header

### Menu mobile — refait entièrement

L'ancien panneau (carte flottante, entrées numérotées `01 Interventions →`)
est remplacé par un panneau plein écran.

- **Plein écran, fond flou.** `position:fixed; inset:0` et
  `backdrop-filter: blur(22px)`. Sous `@supports`, faute de support, le fond
  retombe sur une couleur pleine : jamais de panneau translucide illisible.
- **Le panneau a dû sortir du `<header>`.** Celui-ci porte un
  `backdrop-filter`, qui crée un bloc conteneur pour les descendants en
  `position:fixed` — le panneau restait confiné à la barre.
- **Typographie.** Liens en `clamp(26px, 7vw, 38px)`, icône SVG inline de
  22 px à gauche, héritée en `currentColor`.
- **Section lue** mise en évidence : libellé et icône au laiton, filet
  d'accent qui se déploie sous le lien.
- **Cascade** à l'ouverture, 60 → 480 ms ; la fermeture est groupée.
- **Bas de panneau** : WhatsApp (lien armé par `data-wa`), Prendre contact,
  sélecteur FR/EN. Celui de l'en-tête s'efface pendant l'ouverture pour
  éviter le doublon.
- **Le voile `.mveil` est supprimé** : sans objet sous un panneau plein écran.

### Accessibilité

- `role="dialog"`, `aria-modal`, `aria-expanded`, `aria-hidden` suivi.
- **Tabulation captive** entre le bouton et le contenu du panneau.
- Le premier lien prend le focus à l'ouverture ; Échap rend le focus au
  bouton.
- Fermeture : clic sur un lien, Échap, **glissé vers le haut** (seuil 90 px,
  uniquement en haut de liste pour ne pas gêner le défilement), appui hors
  panneau.

### Header

Déjà conforme : rétraction au scroll (85 → 69 px) et fond flou via `.stuck`.
Ajout de `--h-nav`, publié par le JS, pour que le panneau démarre sous la
barre quelle que soit sa hauteur.

### Navigation

`Témoignage` → **`Étude de cas`** (`Testimonial` → `Case study`), barre et
pied. Le libellé désignait l'étude de cas alors que le témoignage est la
section « Recommandation ».

### Vérifié

9 liens FR et EN, 0 erreur console, clavier complet, `prefers-reduced-motion`
(liens visibles d'emblée, transitions à 0,001 s), desktop inchangé.

### Connu, non corrigé

Sans JavaScript, la navigation mobile reste indisponible : le panneau ne
s'ouvre pas et la barre desktop est masquée sous 1150 px. Condition
préexistante, à traiter si elle doit l'être.
