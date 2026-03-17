# Cahier des Charges Fonctionnel (CDCF) 

## Résumé du projet

Le projet consiste à créer une application web de type "site vitrine". Cette application permettra à des clients potentiels (dits "leads") de visualiser le portfolio de l'entreprise proposant ses services, ainsi que d'obtenir des détails sur des projets réalisés.

## Besoins identifiés

- Un invité doit pouvoir consulter la liste des projets réalisés par l'entreprise; le nom du projet, une courte description, et les technologies sont exposés publiquement. 
- Un invité doit pouvoir consulter les détails d'un projet en particulier.  
- Un invité doit pouvoir consulter les informations de contact de l'entreprise.  
- Un invité doit pouvoir consulter les réseaux sociaux de l'entreprise.  

## Objectifs du projet

- Fournir une interface utilisateur simple et intuitive.  
- Permettre aux invités de visualiser l'entiereté du portfolio de l'entreprise. 
- Permettre aux invités d'obtenir des informations spécifiques à un projet exposé sur le site vitrine.  
- Permettre aux invités de contacter l'entreprise via email. 
- Permettre aux invités de contacter l'entreprise via les réseaux sociaux. 

## Cible du projet

"Personne type" : un **persona**

Le public cible de ce projet sont les professionnels, agences de recrutements & prestations de services, et plus généralement toute entreprise ayant des ressources financières avec besoin de ressources techniques et humaines afin de mener à bien un projet digital.  

## Spécifications fonctionnelles

1. Visualiser la liste des projets du portfolio.
  - Un invité peut consulter la liste des projets du portfolio via la page d'accueil.
2. Consulter un projet avec une vue détaillée. 
  - Un invité peut obtenir des informations complémentaires sur un projet en naviguant sur sa page dédiée.
3. Contacter l'entreprise
  - Un invité peut contacter l'entreprise via ses *socials* (X/Twitter, GitHub, LinkedIn)
  * Un invité peut contacter l'entreprise via email
* 4. Gérer les projets
  - Un administrateur doit pouvoir ajouter un nouveau projet
  - Un administrateur doit pouvoir modifier ou supprimer un projet présent sur le site
  - Un administrateur doit pouvoir identifier des technologies sur un projet

## Arborescence de la solution

1. **Page d'Accueil**
  - Informations de contact de l'entreprise,
  - Liste des projets du portfolio avec description succincte. 
2. **Page de détails d'un Projet**
  - Détails sur le projet sélectionné.
3. **Page d'administration**
  - Gestion des projets existants et des nouveaux projets
4. **Page de contact**
  - Formulaire de demande contact
5. **Page légale**
  - Conformité au RGPD
  - Mentions légales


## Questions de clarification

<details><summary>
Questions
</summary>


1. **Concernant les projets affichés :**

- Les cartes doivent-elles inclure des images des projets ou uniquement du texte ?

- Faut-il prévoir une pagination ou un système de filtrage si le nombre de projets devient important ?

2. **À propos des pastilles technologiques :**

- Doit-on utiliser des couleurs spécifiques pour chaque technologie ?

- La liste des technologies doit-elle être gérée dynamiquement via un fichier de configuration ou un ajout manuel suffit-il ?

3. **À propos du design général :**

- Avez-vous une charte graphique ou des préférences visuelles (polices, couleurs, etc.) ?

- Quelle ambiance souhaitez-vous transmettre (moderne, minimaliste, colorée, etc.) ?

4. **Sur les fonctionnalités spécifiques :**

- Faut-il prévoir une fonctionnalité pour que l'utilisateur puisse partager un projet (réseaux sociaux, e-mail) ?

- Le site doit-il inclure une section "À propos" ou se limiter strictement aux projets et aux contacts ?

5. **Sur les pages du site :**

- Souhaitez-vous des animations de transition entre les pages ou un design plus classique ?

</details>

## Critique et suggestions

<details><summary>
Exemples de suggestions
</summary>

1. **Ajouter des animations légères :**

- Propose d'utiliser des animations CSS simples (ex. : transitions douces au survol des cartes de projets) pour rendre le site plus attrayant, sans alourdir la navigation.

2. **Optimisation pour le futur :**

- Suggérez d’organiser le contenu (projets, technologies) dans un fichier JSON ou une base de données légère (ex. : Firebase) pour permettre une évolution facile du site à long terme.

3. **Améliorer l'accessibilité :**

- Utiliser un contraste fort pour le texte afin d'assurer une bonne lisibilité.
- Prévoir une navigation clavier-friendly et des balises ARIA pour les utilisateurs avec des besoins spécifiques.

4. **Mise en avant du branding :**

- Proposez d’inclure un slogan ou une courte description sous le logo pour mettre en avant l’identité de l’entreprise.

</details>


--------

## Récits utilisateurs

| En tant que    | Je veux                                                        | Afin de                                                                  |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Invité         | pouvoir visualiser la liste des projets réalisés               |                                                                          |
| Invité         | pouvoir visualiser un projet en détail                         |                                                                          |
| Invité         | pouvoir remplir un formulaire de contact                       | d'être contacter par email                                               |
| Invité         | pouvoir consulter la liste des réseaux sociaux de l'entreprise | de contacter l'entreprise via ces réseaux                                |
| Invité         | voir une image illustrant un projet                            | mieux comprendre le rendu ou le type de projet réalisé                   |
| Invité         | filtrer les projets par technologie                            | trouver plus facilement des projets pertinents à mes besoins             |
| Invité         | trier les projets (par date, type, etc.)                       | mieux naviguer dans un grand nombre de projets                           |
| Invité         | partager un projet sur les réseaux sociaux                     | promouvoir ce projet auprès de mes collègues ou collaborateurs           |
| Invité         | accéder au site depuis mobile                                  | consulter le portfolio même en déplacement                               |
| Invité         | consulter une page "À propos" présentant l'entreprise          | mieux comprendre qui est derrière les projets                            |
| Invité         | recevoir une confirmation après envoi du formulaire de contact | être rassuré que mon message a bien été transmis                         |
| Administrateur | m’authentifier pour accéder à la partie admin                  | sécuriser la gestion des projets                                         |
| Administrateur | pouvoir ajouter un projet                                      | d'agrandir le catalogue                                                  |
| Administrateur | pouvoir ajouter une technologie sur un projet                  | faire connaitre les technologies utilisés                                |
| Administrateur | voir la liste des projets existants avec options d’édition     | modifier ou supprimer rapidement un projet existant                      |
| Administrateur | ajouter une image à un projet                                  | rendre la page projet plus visuelle                                      |
| Administrateur | recevoir une copie des demandes de contact par email           | suivre les leads entrants sans se connecter à l’interface admin          |
| Administrateur | être notifié lorsqu’un message de contact est envoyé           | réagir rapidement aux demandes                                           |
| Administrateur | gérer (CRUD) les technologies disponibles                      | garder un référentiel propre pour les technologies associées aux projets |
