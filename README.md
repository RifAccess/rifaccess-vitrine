# RifAccess — site vitrine

Site statique bilingue de présentation du projet **RifAccess**, réalisé dans le cadre du Datathon Data-Territoires 2026.

Le site explique l'indice d'accès rural, présente la méthode du projet et publie son avancement pendant la construction de la future plateforme `app.rifaccess.com`.

## Nom du dépôt recommandé

```text
rifaccess-vitrine
```

Ce nom distingue clairement ce site institutionnel temporaire du futur dépôt de l'application.

## Caractéristiques

- français et anglais avec sélecteur de langue ;
- diagramme interactif saison sèche / saison des pluies ;
- actualités alimentées par un fichier JSON ;
- photographies locales optimisées en WebP et correctement créditées ;
- mise en page responsive et accessible ;
- métadonnées SEO, Open Graph, sitemap et robots.txt ;
- aucun backend, gestionnaire de paquets ou processus de compilation ;
- aucun cookie de suivi.

## Technologies

- HTML sémantique ;
- CSS natif ;
- JavaScript natif ;
- GSAP et ScrollTrigger chargés depuis un CDN ;
- fichiers JSON pour les textes, la configuration et les actualités.

## Lancer le site en local

Le contenu est chargé depuis des fichiers JSON. Il faut donc servir le dossier avec un serveur HTTP local :

```powershell
python -m http.server 8080
```

Ouvrir ensuite `http://localhost:8080/`.

## Modifier le contenu

### Ajouter une actualité

Modifier [`data/updates.json`](data/updates.json). Chaque entrée contient :

- `date` au format `AAAA-MM-JJ` ;
- `tag.fr` et `tag.en` ;
- `title.fr` et `title.en` ;
- `text.fr` et `text.en`.

Conserver une syntaxe JSON valide et une virgule entre les entrées. Les actualités s'affichent dans l'ordre du fichier.

### Modifier les textes

Tous les textes d'interface sont centralisés dans :

- [`i18n/fr.json`](i18n/fr.json) pour le français ;
- [`i18n/en.json`](i18n/en.json) pour l'anglais.

Les chiffres factuels sont également stockés dans ces fichiers. Ne pas ajouter de données non vérifiées.

### Modifier le contact

Changer `contactEmail` dans [`data/config.json`](data/config.json). L'adresse de la future application est définie par `appUrl` dans le même fichier.

### Ajouter une photographie

1. Placer le fichier source dans `assets/img/`.
2. Documenter l'auteur, la source et la licence dans les sections `credits.items` des deux fichiers de traduction.
3. Adapter [`tools/process_assets.py`](tools/process_assets.py), puis exécuter `python tools/process_assets.py`.

## Validation

```powershell
python tools/validate_site.py
node --check assets/js/site.js
```

Le contrôle vérifie les fichiers JSON, les références locales, l'intégrité des images, l'absence d'images distantes et l'absence d'emoji.

## Créer le dépôt dans l'organisation

Créer un dépôt vide nommé `rifaccess-vitrine` dans l'organisation GitHub, sans générer de README, licence ou `.gitignore` depuis GitHub.

Depuis ce dossier local :

```powershell
git add .
git commit -m "Initial RifAccess showcase site"
git remote add origin https://github.com/ORGANISATION/rifaccess-vitrine.git
git push -u origin main
```

Remplacer `ORGANISATION` par le nom réel de l'organisation GitHub.

## Déploiement sur Hostinger

Ce projet est déployable directement : il n'y a ni commande de build ni dossier de sortie intermédiaire.

Dans hPanel :

1. Ajouter ou sélectionner le site `rifaccess.com` comme **site vide**, et non comme site Hostinger Website Builder.
2. Ouvrir **Sites → Gérer → Git**.
3. Renseigner l'adresse du dépôt GitHub et sélectionner la branche `main`.
4. Laisser le champ **Install Path** vide pour déployer à la racine de `public_html`.
5. Vérifier que le dossier de destination est vide avant le premier déploiement.
6. Lancer le déploiement.
7. Activer l'auto-déploiement et ajouter le webhook fourni par Hostinger au dépôt GitHub si les mises à jour doivent être publiées automatiquement.

Pour un dépôt public, utiliser son URL HTTPS. Pour un dépôt privé, sélectionner SSH dans Hostinger et ajouter la clé SSH générée par hPanel comme clé de déploiement du dépôt GitHub.

Après le déploiement, vérifier :

- `https://rifaccess.com/` ;
- `https://rifaccess.com/credits.html` ;
- le sélecteur FR / EN ;
- le chargement de `data/updates.json` ;
- l'image Open Graph `assets/img/og-rifaccess.jpg`.

## Structure

```text
index.html
credits.html
robots.txt
sitemap.xml
assets/
  css/site.css
  js/site.js
  img/
  icons/
data/
  config.json
  updates.json
i18n/
  fr.json
  en.json
tools/
  process_assets.py
  validate_site.py
```

## Crédits et avertissement

Les crédits photographiques détaillés figurent dans [`credits.html`](credits.html).

Projet d'équipe réalisé dans le cadre du Datathon Data-Territoires 2026. Ce site n'est pas une publication du HCP.
