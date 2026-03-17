# Règlement Général pour la Protection des Données

## 1. Pourquoi le RGPD ?

<details><summary>
Pourquoi le RGPD ?
</summary>


📌 **Règlement Général sur la Protection des Données (RGPD)**
 
C'est un texte de loi européen entré en vigueur le **25 mai 2018** . Il a été conçu pour renforcer la protection des données personnelles des citoyens de l’Union européenne et harmoniser les règles entre les États membres.

📌 **Contexte historique** 

Avant le RGPD, la directive 95/46/CE de 1995 régissait la protection des données, mais elle était appliquée différemment selon les pays, entraînant des incohérences. Avec la transformation numérique et l’explosion des données collectées en ligne, une réglementation plus stricte et uniforme est devenue nécessaire.

📌 **Pourquoi est-il important pour les développeurs ?** 
 
- **Obligation légale**  : Toute entreprise qui traite des données personnelles de résidents européens doit respecter le RGPD, même si elle est basée hors d’Europe.
- **Fiabilité et sécurité**  : Appliquer le RGPD garantit une meilleure gestion des données et réduit les risques de cyberattaques.
- **Image et confiance**  : Un site ou une application respectant le RGPD renforce la confiance des utilisateurs.
- **Sanctions élevées**  : En cas de non-conformité, les amendes peuvent atteindre **20 millions d’euros ou 4% du chiffre d’affaires annuel mondial** .

📌 **Exemples d’impacts concrets du RGPD** 
 
- Google a écopé d’une amende de **50 millions d’euros**  en 2019 pour non-respect des règles de consentement.
- Facebook a dû modifier sa gestion des données après plusieurs plaintes.
- De nombreux sites ont dû revoir leurs pratiques pour intégrer des bandeaux de consentement aux cookies.

</details>



## 2. Principes fondamentaux du RGPD

<details><summary>
Principes fondamentaux du RGPD
</summary>

Le RGPD repose sur **7 principes clés** , qui doivent être respectés à chaque étape du traitement des données.

- **1️⃣ Licéité, loyauté et transparence** 
  - 👉 Toute collecte de données doit être justifiée par une base légale et les utilisateurs doivent être informés de manière claire sur l’usage de leurs données.
  - ✅ **Exemple**  : Une application demandant un e-mail pour s’inscrire doit expliquer pourquoi et comment il sera utilisé (newsletter, support, etc.).
 
- **2️⃣ Limitation des finalités** 
  - 👉 Les données doivent être collectées pour un objectif précis et ne pas être utilisées pour autre chose sans un nouveau consentement.
  - ❌ **Non conforme**  : Récupérer l’e-mail d’un utilisateur pour un service, puis le vendre à des partenaires commerciaux.

- **3️⃣ Minimisation des données** 
  - 👉 Ne collecter que les informations strictement nécessaires.
  - ✅ **Bon exemple**  : Pour un formulaire d’inscription, un site e-commerce peut demander **nom, e-mail et adresse** , mais pas la date de naissance si elle n’est pas nécessaire.

- **4️⃣ Exactitude des données** 
  - 👉 Les données personnelles doivent être à jour et exactes.
  - ✅ **Bonne pratique**  : Permettre aux utilisateurs de modifier ou corriger leurs informations personnelles facilement.

- **5️⃣ Limitation de conservation** 
  - 👉 Ne conserver les données que pour la durée nécessaire à l’objectif pour lequel elles ont été collectées.
  - ✅ **Bon exemple**  : Supprimer les comptes inactifs après une certaine période (ex. 2 ans).
  - ❌ **Non conforme**  : Conserver les informations de carte bancaire après la suppression d’un compte.

- **6️⃣ Intégrité et confidentialité** 
  - 👉 Assurer la sécurité des données contre les accès non autorisés, la perte ou la fuite.
  - ✅ **Exemple**  : Stocker les mots de passe de manière chiffrée avec bcrypt au lieu de les conserver en clair.

- **7️⃣ Responsabilité (Accountability)** 
  - 👉 L’entreprise et les développeurs doivent pouvoir prouver qu’ils respectent le RGPD (documentation, audits, mise en conformité).
  - ✅ **Bonne pratique**  : Tenir un registre des traitements de données et utiliser des outils d’analyse de conformité.

 
</details>

## 3. Collecte et traitement des données personnelles

<details><summary>
Collecte et traitement des données personnelles
</summary>
 
📌 **Pour qui ?**
 
L’application du RGPD ne concerne pas uniquement les responsables juridiques ou les **DPO** (Délégués à la Protection des Données). En tant que développeur web, vous êtes en première ligne pour garantir que les données sont collectées, stockées et traitées de manière conforme.
 
 📌 **Qu’est-ce qu’une donnée personnelle ?** 

Le RGPD définit une **donnée personnelle**  comme toute information permettant d’identifier directement ou indirectement une personne. [En savoir plus sur les données personnelles](https://www.cnil.fr/fr/definition/donnee-personnelle). **Exemples courants** : 
- ✅ Nom, prénom, adresse e-mail, numéro de téléphone
- ✅ Adresse IP, cookies, identifiants de connexion
- ✅ Données comportementales (clics, pages visitées, préférences)
- ✅ Certaines **données sensibles**  sont encore plus encadrées (ex. santé, opinions politiques, origine ethnique).


📌 **Bases légales de la collecte et du traitement des données** 
Avant de collecter une donnée, il faut justifier son utilisation avec **une des 6 bases légales**  du RGPD :

| 🏛 Base légale          | 📋 Exemple d’utilisation                                                         |
| ------------------------ | --------------------------------------------------------------------------------- |
| Consentement             | Un utilisateur accepte de recevoir une newsletter                                 |
| Contrat                  | Une boutique en ligne collecte l’adresse pour livrer un produit                   |
| Obligation légale        | Une entreprise stocke des factures pour la comptabilité                           |
| Intérêts légitimes       | Un site analyse les performances pour améliorer l’expérience utilisateur          |
| Mission d’intérêt public | Un site gouvernemental collecte des informations pour une démarche administrative |
| Intérêt vital            | Un hôpital collecte des données pour soigner un patient inconscient               |


**📌 Gestion du consentement et des préférences des utilisateurs** 
Le consentement doit être :
- ✅ **Libre** (pas de case précochée)
- ✅ **Éclairé** (l’utilisateur sait pourquoi ses données sont utilisées)
- ✅ **Révocable** à tout moment
 
</details>


## 4. Droits des utilisateurs

<details><summary>
Droits des utilisateurs
</summary>

Le RGPD donne aux utilisateurs un contrôle total sur leurs données.

| ⚖ Droit                       | 🔍 Explication                                                       | 🛠 Application en dev                      |
| ------------------------------ | --------------------------------------------------------------------- | ------------------------------------------- |
| Accès                          | L’utilisateur peut demander quelles données sont stockées sur lui     | Ajouter un bouton “Télécharger mes données” |
| Rectification                  | Il peut modifier ses données incorrectes                              | Interface pour éditer ses informations      |
| Effacement ("droit à l’oubli") | Il peut demander la suppression de ses données                        | Ajouter une option “Supprimer mon compte”   |
| Portabilité                    | Il peut récupérer ses données pour les transférer ailleurs            | Fournir un fichier exportable (JSON, CSV)   |
| Opposition                     | Il peut refuser l’utilisation de ses données pour certaines finalités | Paramètres pour désactiver le tracking      |
| Limitation                     | Il peut demander de figer temporairement ses données sans suppression | Mise en pause du traitement des données     |

</details>

## 5. Sécurité des données

<details><summary>
Sécurité des données
</summary>

La protection des données est **une obligation légale** . Un manquement peut entraîner une amende ou une perte de confiance des utilisateurs.

**📌 Bonnes pratiques pour sécuriser les données en développement web** 

- ✅ **Stockage sécurisé** 
  - Ne jamais stocker de mots de passe en clair (utiliser du hashage avec argon2, bcrypt, ...)
  - Chiffrer les données sensibles (ex. AES pour les numéros de carte bancaire)

- ✅ **Contrôle des accès** 
 - Implémenter une authentification forte (Multi-facteur)
 - Restreindre l’accès aux données selon les rôles (admin, utilisateur)

- ✅ **Sécurisation des APIs** 
 - Controller les entrées utilisateurs
 - Limiter les appels API  avec du throttling

- ✅ **Gestion des violations de données** 
 - Détecter les anomalies avec des logs et alertes
 - Prévoir un plan de réponse en cas de fuite  (notification des utilisateurs, actions correctives)

</details>

## Sources 

- [RGPD](https://www.cnil.fr/fr/reglement-europeen-protection-donnees)
- [CNIL](https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on)

## Lexique

**RGPD** 🇪🇺 = Règlement Général sur la Protection des Données

**CNIL** 🇫🇷 = Commission Nationale Informatique et Libertés

**ANSII** = Agence nationnale de la sécurité des systèmes d'information

**Intégrité** = pas falsifiable

**Confidentialité** = pas consultable

**Identité** = pas d'usurpation (de la source)

**DPO** = Délégué à Protection des Données (généralement juriste)

**CSO** = Chief Security Officer (chargé la sécurité) / DevSecOps

