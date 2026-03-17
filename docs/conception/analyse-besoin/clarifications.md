# Clarification du besoin 

Le projet : Oquiz

Le commanditaire : Jeff 

## Pourquoi clarifier ?

Déroulé : laisser les étudiants donner en vrac : 
- des outils de gestion de projet
- des points à prendre en considération sur un nouveau projet
- des questions à poser à Jeff pour clarifier le projet Oquiz

## Demande client 

Que prévoir ? 
- Cahier des Charges
- Ressources humaines & chiffrage du projet
- Architecture de solution
  - API/SPA ou SSR ?
- Comprendre le besoin et en déduire la liste des fonctionnalités attendues
  - Spécifications de l'application
- Notions 
  - Plateforme cible (Mobile, Desktop, Responsive)
- Web Design 
  - UI/UX
  - Maquettes et prototypes
- Organisation
  - Agiles
  - Kanban
  - Roadmap
  - Retro-planning
- Déploiement, dimensionnement de l'hébergement (scalabilité) et maintenance et monitoring
- Sécurité
- Tests
- SEO
- Données fournies
- Budget

## Questions en vrac (des étudiants)

- **Q. Quelle est la cible du projet ?**
  - 1 école < 1000 élèves 
  - => pas besoin de prévoir une grosse scalabilité de l'application.
  - évolution à court/moyen termes ? => pas prévu ici 

- **Q. Taille / durée d'un quiz ? **
  - variable, ça dépend de ce que souhaite l'auteur/autrice du quiz
  - entre 1 question --> pas de limite du nb de question. En moyenne une dizaine de questions.

- **Q. De quoi parle les quiz ?** 
  - Un quiz c'est un regroupement de question 
  - ex : QUIZ n°1 Le quiz de la tartiflette
    - ex : QUESTION n°1 comment sont traditionnellement coupés les oignons ? 
      - ex : PROPOSITION n°1 - en dé
      - ex : PROPOSITION n°2 - en lamelle ✅
      - ex : PROPOSITION n°3 - en julienne
      - ex : PROPOSITION n°4 - en entier

- **Q. Qui écrira les questions ?**
  - les utilisateurs qui auront des droits particulier : droits d'édition sur les quiz
  - 2 approches : 
    - approche "seeding" : Jeff nous fourni quelques quizzes de bases
    - approche "production" : nous fournirons l'application "vierge" sans données, avec un admin (Jeff) capable de fournir les droits à nos divers utilisateurs afin qu'ils puissent créer des vrais quiz.
  - Quel nom donne-t-on aux applications qui arrivent "vierges" et dont on peut se servir comme des services ?
    - ==> SaaS = Software as a Services

- **Q. Questions QCM ou QCU ?**
  - On s'impose d'avoir des QCU - Question à réponse unique
  - combien de proposition : minimum 2, maximum 6

- **Q. Quels outils/technos à utiliser ? Quelle approche architecturale ?** 
  - Expert JS -> du JS. 
  - Quelle type de base de données ? 
  - **API + SPA** ou **SSR**
  - On part plutôt sur une API pour deux raisons : 
    - Separation des responsabilités (dans le cadre du cours, on ne se soucis que de l'API)
    - Intéraction : certaines fonctionnalités demandent des appels asynchrone (création d'un quiz)
  - On se réserve la possibilité d'ajouter quelques pages (et/ou services !) pour profiter des avantages du SSR 
    - ex : pourquoi une **landing page** référencée servi en SSR ?
    - Tips pour le Titre Pro : penser à une landing page à part pour traiter les questions SEO

  - **Q. Base de données ? SQL ou NoSQL ?**
    - Est-ce qu'on a des données structurées ? --> si oui, SQL
    - Structurée = tables, type de champs strictes, associations (clé étrangères et contraires)
    - BDDR = Base de données **Relationnelles** (🇺🇸 relation = table) : 
      - MySQL = très souvent fourni par défaut par l'hébergeur 
      - **PostgreSQL** = performant, complet, très utilisé dans l'industrie
      - MariaDB
      - Oracle

- **Q. "Site web" ou "application" ?**
  - attention bcp d'abus de langage. 
  - ici, on parle plutôt d'application car nos fonctionnalités sont variées

- **Q. Données dont on a besoin par utilisateur ? Gestion des données personnelles ?**
  - [fiche sur le RGPD](../../fiches/rgpd.md)
  - prévoir une page de profil (droit d'accès de nos utilisateurs)
  - prévoir quelles données on récolte au moment de l'inscription : 
    - email
    - password
    - firstname
    - lastname

- **Q. Faut-il s'inscrire ? Droits des administrateurs ? Quels sont les rôles ?** 
  - 4 rôles pour nos utilisateurs
    - **visiteurs** (non connecté) : login/signup/home/landing
    - **membres** (connecté) : jouer un quiz/consulter la liste des quiz/accéder à son profil
    - **auteurs** : membre avec droits d'éditions sur les quizzes mais pas que
    - **admin** : gérer les droits des autres utilisateurs, supprimer un compte

- **Q. Suivi des résultats : on nous parle d'affichage uniquement ?**
  - en terme de modélisation, ça peut être interessant de réfléchir à "comment stocker les résultats des quizzes" ?
  - on se laisse la possibilité de le faire

- **Q. Durée de conservation des données ?**
  - à l'inscription (page de signup), prévoir : 
    - consentement explicite des données récoltés (case à cocher)
    - durée de conservation ==> prévoir des fonctionnalités de suppression automatique de données
      - conception : **un CRON** = script programmé pour un certain moment
        - tous les jours, à midi, on cherche les utilisateurs dont la dernière activités remonte à plus de 2 ans
        - et si c'est le cas, on supprime leur données

- **Q. Thème et sujet ? Pas bien compris la différence ?** 
  - Modélisation : un thème peut avoir un sous-thème -> oui, on verra ça au niveau du MCD/MLD

- **Q. Identité graphique de l'application ? Est-ce qu'on nous la fourni ?** 
  - A nous de jouer (cours de SC01E02 - Web design)

- **Q. Sécurité de l'application ? Evaluation des risques ?**
  - Au fur et à mesure du développement

- **Q. Gestion des traductions ? (`i18n` - internationalization)**
  - Pas le temps

- **Q. Accessibilité (`a11y` - accessibility)**
  - Au fur et à mesure du développement 
  - Surtout pendant l'apothéose 
  - A la limite pour la landing page
  - Mon conseil pour bosser l'accessibilité : [RGAA critères et tests](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11)

- **Q. Interlocuteur ?**
  - Votre cher formateur

- **Q. Export de données ? Exporter les résultats ?** 
  - Pas le temps -> iteressant notamment pour les question RGPD.
  - A defaut, une page de profil

- **Q. Programme publicitaire/SEO**
  - Prévoir une landing page, indépendante de l'application principale
  - [voir fiche recap' SEO](../../fiches/seo.md)
