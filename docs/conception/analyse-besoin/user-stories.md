# Récits utilisateurs (🇺🇸 user stories)

## Déroulé

- Expliquer le principe, l'objectif et le formalisme des users stories aux apprennants
- Ecrire 2-3 user stories pour montrer des exemples
- Laisser les élèves travailler en autonomie sur un document commun, par exemple un [framapad](https://framapad.org/abc/fr/)
- Relire/Ajuster/Corriger les propositions des apprenants 
- Fournir une correction des user stories

## Définition

Un user story = une action utilisateur

Les user sont des **scenari de tests** pour représenter une part du fonctionnement d'une application.

Permet d'avoir une vue d'ensemble de l'application des actions de l'utilisateur

## Formalisme

- 🇫🇷 `En tant que [role], je souhaite [action] (( , afin de [finalité] ))`
- 🇺🇸 `As a [role], I want to [action] (( in order to [goal] ))`

## Conseils

- **rôle** ~= état de l'utilisateur (en sens large)
  - réfléchir aux rôles en amont : 
    - **visiteurs**
    - **membres** (connectés)
    - **auteurs**
    - **administrateurs**
    - utilisateur mobile

- rendre vos user stories les plus atomiques possibles
  - en tant qu'auteur, je souhaite ajouter des quiz afin d'étoffer le catalogue.
    - ❌ sous entend une fonctionnalité d'ajout de plusieurs quiz (ex import en batch de quiz)
  - en tant qu'auteur, je souhaite ajouter un quiz, afin d'étoffer le catalogue.
    - ✅ sous entend une interface pour ajouter un quiz

- notes : c'est un exercice qui reste tout de même assez "subjectif", l'objectif étant de se faire comprendre.
  - objectif : rendre le cahier des charges le moins sujet à interprétation.

- plus on passe du temps sur les user stories, moins on a de surprise au moment du développement
  - pas surprennant d'y passer une heure et de revenir souvent dessus !

- n'hésitez pas à faire plusieurs passes : un premier jet, puis on affine à la relecture

## Variantes 

> Le **récit d'abuseur** (jeu de mots en anglais entre « user story » et « **abuser story** ») est une variante utilisée pour intégrer la sécurité dès le début des développements. Ce type de récit présente les intentions d'un utilisateur malveillant que l'on cherchera à tenir en échec.
> [Wikipédia](https://fr.wikipedia.org/wiki/R%C3%A9cit_utilisateur) 

Exemple : 
- En tant qu'utilisateur malveillant, je souhaite pouvoir exécuter une injection SQL dans un champ afin de voler des informations sur la base de données.

## Correction

Hiérarchie des droits : 
- `Visiteur <-- Membres <-- Auteur <-- Admin`


| En tant que | je souhaite pouvoir                                                 | afin de                                              |
| ----------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| visiteur    | accéder à une page d'accueil                                        | prévisualiser le contenu du site                     |
| visiteur    | accéder à un formulaire de connexion                                | pouvoir me connecter                                 |
| visiteur    | accéder à un formulaire de création de compte                       | pouvoir créer un compte                              |
| visiteur    | réinitialiser mon mot de passe                                      | palier à un éventuel oubli                           |
| visiteur    | lister un échantillon de quiz récents                               | pouvoir prévisualiser quelques quiz existants        |
| membre      | lister l'intégralité des quiz                                       |                                                      |
| membre      | lister les thèmes de la plateforme                                  |                                                      |
| membre      | lister les quiz d'un thème donné                                    |                                                      |
| membre      | jouer un quiz                                                       | répondre aux questions de ce quiz                    |
| membre      | obtenir mon score sur un quiz                                       |                                                      |
| membre      | visualiser mes bonnes et mauvaises réponses                         |                                                      |
| membre      | lister l'ensemble des quiz joués                                    | connaitre mes scores                                 |
| membre      | rechercher un quiz                                                  | le trouver un quiz via un ou plusieurs mots clés     |
| membre      | supprimer mon compte                                                | supprimer mes informations personnelles              |
| membre      | me déconnecter                                                      |                                                      |
| auteur      | lister les quiz que j'ai créé                                       |                                                      |
| auteur      | créer un nouveau quiz                                               | d'élargir le catalogue de quiz                       |
| auteur      | accéder au formulaire d'édition d'un quiz                           |                                                      |
| auteur      | ajouter une question d'un quiz                                      |                                                      |
| auteur      | modifier une question d'un quiz                                     |                                                      |
| auteur      | supprimer une question d'un quiz                                    |                                                      |
| auteur      | ajouter une proposition à un quiz                                   |                                                      |
| auteur      | modifier une proposition à un quiz                                  |                                                      |
| auteur      | ajouter une proposition à un quiz                                   |                                                      |
| auteur      | accéder aux scores des utilisateurs qui ont joué mon quiz           | connaitre sa bonne/mauvaise réussite                 |
| admin       | ajouter un thème                                                    | étendre le pool de thèmes assignables aux quiz       |
| admin       | modifier un thème                                                   |                                                      |
| admin       | supprimer un thème                                                  |                                                      |
| admin       | ajouter un niveau de difficulté                                     | étendre le pool de niveaux assignables aux questions |
| admin       | modifier un niveau de difficulté                                    |                                                      |
| admin       | supprimer un niveau de difficulté                                   |                                                      |
| admin       | consulter le nombre de questions associés à un niveau de difficulté |                                                      |
| admin       | modifier le rôle d'un utilisateur                                   |                                                      |

