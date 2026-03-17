# Guide du SEO

## Améliorer le contenu

- Optimiser vos [choix de mots clés](https://search.google.com/search-console) à l'aide d'outils d'adaptés et en [fonction des tendances](https://trends.google.fr/trends/).
- Analyser son [trafic](https://tagmanager.google.com).
- Les titres de la page doivent être clair avec du contenu pertinent.
- Le titre du document (`<title>`) doit être [descriptif et accessible](https://developer.mozilla.org/fr/docs/Web/HTML/Element/title).
- Le titre principal (`<h1>`) doit contenir le mot clé principal, être court (10-12 mots) et attractif.
- Utiliser des [mots de transitions](https://www.gimmesocialweb.fr/mots-de-transition-yoast-liste-complete/).
- Avoir des liens entrant provenant d'autres sites (`backlink`).
- Proposer du contenu récent (blog, ...)

## Améliorer l'accessibilité

- Vérifier la sémantique HTML ([w3c validator](https://validator.w3.org/)).
- Vérifier le responsive du site (`device toolbars` dans les `devtools` Chrome).
- Vérifier les bonnes pratiques d'accessiblités (images, contrastes, ...).


## Améliorer les performances

- Analyser ses performances à l'aide de la [LightHouse](https://chromewebstore.google.com/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk?hl=fr).
- Vérifier vos liens internes (pas de 404, y compris la `favicon`).
- Optimiser vos images (préférés les formats `webp` par exemple).
- S'assurer d'un chargement rapide de la page.
- Différer le chargement des scripts et styles non essentiels.
- Retirer les fonctionnalités non essentielles.
- Utiliser du `Server Side Rendering` (SSR) plutôt que de l'éxécution de code côté client.

## Améliorer les métadonnées

- Utiliser les balises `<meta>` (description, author, ...).
- Utiliser l'Open Graph Protocol (`og:title`, `og:image`, ...).
- Proposer un `sitemap.xml` pour son site.
- Proposer un fichier `robots.txt`.