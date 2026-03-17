# Challenge SC02E02 - Déploiement et documentation

## Rappel : Git Flow

Penser à mettre à jour votre dépôt à l'aide du Git Flow, et à créer une branche dédiée pour réaliser le challenge.

## Étape 1 - Déploiement

Si cela n'a pas été fait pendant le cours, **réaliser le déploiement de l'application Oquiz conteneurisée** sur votre VM Kourou (Cloud)

- [ ] Se connecter en SSH à sa VM Kourou
- [ ] Installer Docker Engine
- [ ] Ajouter une clé SSH GitHub
- [ ] Cloner le dépôt 
- [ ] Copier le `.env.docker.example` dans un `.env.docker` 
- [ ] Ajuster les variables d'environnement en les adaptant à la production à l'aide de `nano`
- [ ] Lancer les services via `docker compose` 
- [ ] Tester le bon fonctionnement de l'application

## Étape 2 - Documentation

Dans le fichier `INSTALL.md`, ajouter une section pour la production : 
- documenter les commandes nécessaires au **déploiement initial** sur une nouvelle machine virtuelle.
- documenter les commandes nécessaires pour un **redéploiement** de l'application après la modification de son code.

## Étape 3 - Diagramme de déploiement

Réaliser un [diagramme de déploiement](https://plantuml.com/fr/deployment-diagram) de l'application conteneurisée en production. Utiliser au choix : 
  - la syntaxe `plantuml`
  - un simple diagramme réalisé avec `Draw.io`


<details><summary>
Un peu d'aide sur la nomenclature d'un diagramme de déploiement
</summary>

Les éléments essentiels sont :
- **node** : représente un nœud physique ou virtuel (serveur, machine, appareil mobile, container…).
  - peut être "stéréotypé" pour préciser (ex. `<<device>>` pour un appareil physique, `<<executionEnvironment>>` pour un conteneur d’exécution).

- **artifact** : fichier ou package déployé (binaire, image Docker, script…). 
  - peut être relié au node par une relation de déploiement.

- **component** : composant logiciel (module, microservice, librairie…)
  - peut être packagé dans un artefact.

- **interface** : point de communication fourni ou requis par un composant.

- **database** (sous-type de node) : pour représenter un serveur ou service de base de données.

- **device** (sous-type de node) : pour du matériel spécifique (smartphone, capteur, imprimante…).

</details>
