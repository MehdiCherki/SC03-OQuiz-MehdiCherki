# 🧠 MERISE : du besoin au modèle physique

La méthode **MERISE** permet d'analyser, modéliser et concevoir un système d'information en séparant les niveaux conceptuel, logique et physique. Voici les principales étapes du processus de modélisation des données.


## 📊 Résumé

| Étape                       | Objectif                                 | Nature du contenu             | Dépendant du SGBD ? |
| --------------------------- | ---------------------------------------- | ----------------------------- | ------------------- |
| **Recueil des données**     | Comprendre le besoin métier              | Liste d’infos et règles       | ❌ Non              |
| **MCD**                     | Représenter les données conceptuellement | Entités, associations         | ❌ Non              |
| **MLD**                     | Structurer les données relationnelles    | Tables logiques               | ⚠️ Peu            |
| **Dictionnaire de données** | Documenter chaque donnée                 | Définitions, types, règles    | ✅ Oui              |
| **MPD**                     | Implémenter la base                      | Tables physiques, contraintes | ✅ Oui              |

Note : Le recueil des données et le dictionnaire de données ne sont pas partie intégrante de la méthodologie MERISE mais peuvent aider dans la conception des modèles MERISE.

Note : [Ingénierie des systèmes d'information : MERISE deuxième génération](https://www.lirmm.fr/~laurent/POLYTECH/IG4/RAPPELS-MERISE/LivreMerisePDF-total-12sept14.pdf)

---

## 📋 Recueil des données  
**But** : Comprendre le métier, identifier les besoins, les informations à gérer et les règles de gestion.  
**Outils** : Interviews, questionnaires, observations, documents existants.  
**Livrables** : Liste d’entités, processus métiers, contraintes, premières relations entre données.

---

## 🔗 MCD – Modèle Conceptuel de Données  
**But** : Représenter les **entités**, leurs **associations** et leurs **attributs**, sans contrainte technique.  
**Aspect** : Schéma conceptuel, indépendant de tout SGBD.  
**Exemples** : Client, Commande, Produit, liés par des associations (Ex : "Passe", "Contient").  
**Outil** : Graphique (`Draw.io`) ou graphique maintenu par du code `MoCoDo`.

---

## 🧱 MLD – Modèle Logique de Données  
**But** : Traduire le MCD en **tables relationnelles** (SGBD relationnel), avec des clés primaires et étrangères.  
**Aspect** : Tables, colonnes, types logiques, cardinalités traduites.  
**Spécificité** : Prêt pour l’implémentation mais pas encore optimisé selon le SGBD cible.
**Exemple** : `Table CLIENT (id_client, nom)`, `table COMMANDE (id_commande, id_client, date)` ou une représentation graphique équivalente.

---

## 📑 Dictionnaire de données  
**But** : Décrire **chaque donnée** du modèle (signification, type, unité, format, source, contrainte).  
**Aspect** : Tableau décrivant tous les champs manipulés dans le SI.  
**Utilité** : Aide à la clarté, au développement et à la documentation.
**Exemple** : Tableau (nom de donnée, description, type, contraites, source, exemple)

---

## 💾 MPD – Modèle Physique de Données  
**But** : Implémenter concrètement la base dans un SGBD précis (PostgreSQL, MySQL, Oracle…).  
**Aspect** : Tables avec types physiques, index, contraintes (clé étrangère, unique, not null, etc.), performances.  
**Exemple** : `SQL CREATE TABLE` ou une représentation graphique équivalente
**Outil** : Extension `PostgreSQL` dans `VSCode` par exemple
