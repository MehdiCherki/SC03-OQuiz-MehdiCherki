# MLD - Modèle Logique de Données

C'est un exercice de "traduction" du MCD : 
- français -> anglais
- concept -> technique
- on ne choisit pas encore le SGBD (Postgres, MySQL) mais on organise nos tables 
- entité -> tables
- attributs -> colonnes/champs
- cardinalités :
  - clé primaires / clé étrangère
  - tables de liaison
- on ne précise pas les types

Exercice moins formalisé que le MCD (textuel, schéma). 


## Textuel 

- 1. Traduire les entités
- 2. Traduire les attributs
  - ajouter les id (clé primaire)
- 3. Traduire les associations

```
Toutes les tables possèdent également les champs :
- `created_at`
- `updated_at`


user (
  id
  firstname
  lastname
  email
  password
  role
)

quiz (
  id
  title
  description
  author_id       # FK->user.id
)

tag (
  id
  name
  color
  parent_tag_id    # FK->tag.id
)

question (
  id
  description
  anecdote
  wiki_link
  quiz_id          # FK->quiz.id
  level_id         # FK->level.id
)

choice (
  id
  description
  is_valid
  question_id      # FK->question.id
)

level (
  id
  name
)

attempt (
  id 
  user_id            # FK->user.id
  quiz_id            # FK->quiz.id
  user_score
  max_possible_score
)

quiz_has_tag (
  quiz_id             # PK_composite  # FK->quiz.id
  tag_id              # PK_composite  # F>tag.id
)
```

Pour `Attempt`, on rajoute un ID plutôt qu'une clé composite (`user_id`, `quiz_id`) sinon on ne pourrait pas avoir un utilisateur qui joue 2 fois le même quiz


### Règle de traduction des associations

```
ENTITÉE  -- X,Y --- ASSOCIATION ---- U,V  --- ENTITÉE
          max(X,Y)                 max(U,V)


Utilisateur -- 0,N --- CREER ---- 1,1 ----- Quiz
             max(0,N)            max(1,1)
            = N                  = 1

==> 1-N
==> One-To-Many
```

- **One-To-One** :
  - il suffit d'ajouter un champ (scalaire) sur une des tables
- **One-To-Many** :
  - il suffit d'ajouter une clé étrangère sur une des tables (côté du 1) qui pointe vers la clé primaire de l'autre table
- **Many-To-Many** : 
  - il suffit d'ajouter une table de liaison, qui porte deux clés étrangères, qui pointent vers les deux clés primaires des autres tables