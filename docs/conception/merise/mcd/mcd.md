# MCD - Modèle conceptuel de données

## Conseils

- Attendu : un schéma
- Conseil : commencer par un brouillon textuel

## Règles & vocabulaire

- Exercice académique, donc plein de règles, parfois pénible
- MCD rédigé en **français**. C'est un document **conceptuel**. A ce stade, on est pas dans la technique, on est dans la modélisation du problème.
- On ne précise pas les types sur un MCD (pas choisi le SGBD)
- On parle : 
  - d'entité  (on ne parle PAS de table)
  - d'attributs   (on ne parle PAS de champs/colonnes)
  - cardinalité   (on ne parle PAS de clé étrangères)
  - pas d'ID  (on ne pas PAS de clé primaire)

## Brouillon

### Définir les entités et leurs attributs

```
Utilisateur (
  _email
  prénom
  nom
  mot de passe
  role
)

Quiz (
  _référence quiz
  titre
  description
  auteur ?
  themes ?
  questions ? 
  date de création
  date de modification
)

Thème (
  _nom
  couleur
  sous thème ? 
)

Question (
  _référence question
  description
  anecote
  lien wikipédia
  niveau de la question ?
  propositions (choix) de réponse ? 
)

Choix (
  _référence choix
  description
  est valide
  question concerné ?
)

Niveau (
  _référence niveau
  nom
)

Tentative (
  _référence tentative
  quiz ?
  joueur ?
  score
  score max atteignable
)
```

### Choisir si on définie une entité complémentaire ou on laisse un attribut complémentaire sur une entité

- Est-ce qu'on fait une entité dédiée pour un champ scalaire (string) ?
  - Ex : si le thème c'est juste le "nom" alors :
    - est-ce qu'on met un champ `theme name` sur la table `quiz`
    - est-ce qu'on fait une table à part `theme (name)`

- C'est la notion de normalisation : si une information apparait deux fois dans une BDD, on cherche à les regrouper

- Une manière de choisir c'est de penser CRUD : 
  - est-ce que j'ai besoin de faire le CRUD sur l'entité en question ? 
    - Si OUI => une entité à part
    - Si NON => on peut garder un champ scalaire


Champ scalaire : 
- ✅ string, number, booléens (valeurs primitive)
- ❌ tableau, objets (structure de données)

### Choisir un déterminant/discriminant

L'attribut qui caractérise de manière unique un représentant de l'entité. En général, un attribut qui ne change pas dans le temps.

Si aucun attribut n'assure ce rôle, on peut gonfler le modèle à l'aide d'un : 
- `code <entité>` ou
- `reference <entité>` ou
- `identifiant <entité>` ou
- `numéro <entité>`

### Schématisons !

Outils : 
- 🔥 `Draw.io` + Extension VSCode `Draw.io Intégration` (Henning Dieterichs)
  - il suffit ensuite de créer des fichiers avec l'extension `.drawio`
- `MoCoDo` (via https://www.mocodo.net/)
  - seulement pour mettre au propre

Règles 
- Rectangle pour les entités
- Rond pour les associations
  - cardinalités de PART et d'AUTRE de l'association
  - NOMMER : verbe à l'infinitif, potentiellement à la voix passive
