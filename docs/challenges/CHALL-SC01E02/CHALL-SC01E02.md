# Challenge SC01E02 - Web Design

On reprend le projet du challenge de la journée précédente : **O'vitrine**

## Création d'une branche

Une fois n'est pas coutume : 
- on créé une branche pour réaliser le challenge sur une nouvelle branche dédiée :
  - `git checkout -b SC01E02-challenge`
- on push cette branche 
  - `git push --set-upstream origin SC01E02-challenge`

## Wireframes

Préparer quelques wireframes pour les pages & cas d'utilisation suivants :
- Consulter la liste des projet
- Consulter les détails d'un projet
- Prise de contact via un formulaire
- Ajouter un nouveau projet
- Administrer les projets existants

Notes : 
- selon le temps à votre disposition, il n'est pas nécessaire de réaliser tous les wireframes : mieux vaut un wireframe complet et détaillé que plusieurs réalisés à la va-vite
- utiliser l'outil de votre choix (Whimshical, TLDraw, Wireframes.cc, Figma...)
- penser aux cas de consultation sur mobile
- respecter les règles de création de wireframes (pas de couleurs, pas d'images, etc...)

## Mockup

Parmi les wireframes réalisés, selectionnez en un pour réaliser sa maquette (Mockup) à l'aide de l'outil de votre choix : Figma, Penpot...

## Diagramme de séquence

Réaliser un [diagramme de séquence PUML](https://plantuml.com/fr/sequence-diagram) pour concevoir la fonctionnalité de **prise de contact par mail via un formulaire**. Le fonctionnement attendu par le client est le suivant :
- l'utilisateur consulte la page de contact
- l'utilisateur complète un formulaire présent sur cette page
  - s'il y a une erreur dans le formulaire, l'interface lui indique ce qu'il faut corriger
- le système vérifie que le mail renseigné n'a pas déjà été renseigné antérieurement, auquel cas l'interface lui indique
- dans le cas contraire, le mail renseigné est sauvegardé dans la base des prospects (clients potentiels). L'interface lui indique ensuite qu'un mail de confirmation lui a été envoyé pour confirmer la bonne prise en charge de sa demande de contact.