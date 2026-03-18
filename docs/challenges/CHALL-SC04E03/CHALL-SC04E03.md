# Challenge 03

## Exercice n°1 : Sauvegarder les informations du fichier en BDD

- Initialiser prisma
- Créer un modèle prisma avec les champs
  - `id` : Entier clé primaire
  - `size`: Entier
  - `newFilename` : Chaîne de caractère avec contrainte unique
  - `originalFilename` : Chaîne de caractère
  - `mimetype`: Chaîne de caractère
  - `createdAt` : Date avec contrainte de valeur par défaut
  - `updatedAt` : Date avec contrainte de valeur par défaut
- Lors de l'upload sauvegarder les informations du fichier uploader en BDD

## Exercice n°2 : Récupérer un fichier

- Créer une route `GET /api/files/:id`
- Depuis cette route récupérer et renvoyer le fichier correspondant à l'id (renvoyer le fichier en lui même, pas les données de la BDD)

## (Bonus) Exercice n°3 : Modifier les images en live

- Installer et utiliser le module `sharp` (https://www.npmjs.com/package/sharp) pour gérer la modification des images.
- Les modifications possible seront passé dans les query params
  - Exemple : `/api/files/12?resize=240x500`
- Exemple de query params attendus :
  - `resize` : Chaîne de caractère avec format `widthxheight`
  - `quality` : Entier entre 1 et 100
  - `rotate` : Entier entre -180 et 180
  - `blur` : Entier entre 0 et 100
  - `format` : `webp`, `jpg`, `png`, `jpeg`
  - `negate` : Chaîne de caractère avec valeur `true` ou `false`
  - `tint` : Chaîne de caractère avec format `#RRGGBBCHALL-SC04E03  - `crop`: Chaîne de caractère avec format`left,top,width,height`
