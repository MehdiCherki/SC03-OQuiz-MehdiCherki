# MCD vs MLD vs MPD

- [MCD vs MLD vs MPD](#mcd-vs-mld-vs-mpd)
  - [Définitions](#définitions)
    - [MCD - Modèle Conceptuel de Données](#mcd---modèle-conceptuel-de-données)
    - [MLD - Modèle Logique de Données](#mld---modèle-logique-de-données)
    - [MPD - Modèle Physique de Données](#mpd---modèle-physique-de-données)
    - [En résumé :](#en-résumé-)
  - [Exemple](#exemple)
    - [Un problème à traiter](#un-problème-à-traiter)
    - [MCD](#mcd)
    - [MLD](#mld)
    - [MPD](#mpd)
  - [Modélisation alternative (avec `id`)](#modélisation-alternative-avec-id)

## Définitions

Le `MCD`, le `MLD` et le `MPD` sont tous des concepts utilisés dans la conception de bases de données relationnelles pour décrire différents niveaux de modélisation. Ils découlent d'une méthodologie appellée `Merise`.

### MCD - Modèle Conceptuel de Données

<details><summary>
Le MCD est la première étape de la modélisation de base de données.
</summary>

-  Il s'agit d'une **représentation abstraite des entités, des associations et des contraintes qui existent dans le domaine du problème à résoudre**. 
- Le `MCD` est généralement créé à l'aide de **diagrammes entité-association (ER)** qui montrent les **entités** (objets ou concepts du monde réel), leurs **attributs** et les relations entre elles. 
- Le `MCD` se concentre sur la définition des concepts sans entrer dans les détails techniques de mise en œuvre.
  
</details>


### MLD - Modèle Logique de Données

<details><summary>
Le MLD est la deuxième étape de la modélisation de base de données.
</summary>

- Il s'agit de convertir le `MCD` en une représentation plus proche de la structure d'une base de données relationnelle. 
- Le MLD se concentre sur la conversion des entités, des attributs et des associations en **tables**, **colonnes** et **clés**. On utilise généralement le modèle de données relationnel (`tables`, `clés primaires`, `clés étrangères`, etc.) pour représenter le `MLD`. 
- C'est à ce stade que des décisions sur la normalisation et la dénormalisation sont prises pour optimiser la structure de la base de données.


</details>


### MPD - Modèle Physique de Données

<details><summary>
Le MPD est la dernière étape de la modélisation de base de données.
</summary>

Il s'agit de traduire le `MLD` en une représentation spécifique au système de gestion de base de données (`SGBD`) choisi. 
- Cela implique de définir les **types de données**, les **index**, les **contraintes d'intégrité** et d'autres détails techniques nécessaires pour mettre en œuvre efficacement la base de données sur un SGBD particulier.
- Le MPD détermine comment les données sont stockées physiquement sur le disque et comment elles sont accessibles.

  
</details>


### En résumé :

- le `MCD` est un modèle abstrait des concepts et des associations.
- le `MLD` est une représentation plus structurée en utilisant des tables et des clés
- le `MPD` est la mise en œuvre concrète du modèle dans un SGBD spécifique avec des détails techniques.


## Exemple

### Un problème à traiter

```
Un roboticien a besoin d'un système pour gérer son parc de robots. 
- Le parc est composé de plusieurs **robots** qui portent chacun une référence (unique au monde), un nom d'usage, une date de fabrication. 
- Les robots passent par différents **ateliers** pour leur maintenance. Un atelier porte un nom (unique), est situé dans une section du parc, et possède un code couleur.
- Dans chaque atelier, on retrouve des **outils** de maintenance. Un outil porte un nom, une taille, un prix. Un outil ne peut pas se trouver dans deux ateliers à la fois, et les ateliers ne s'échangent pas les outils.
```

<details><summary>
Exemples de données pour le problème
</summary>

- Le robot `TKTMOCHI42` surnommé `Rigatonik` (2011) doit passer par les ateliers `Montage` (section `B9`), `Lustrage` (`B42`), `Déboulonnage` (`B42`) pour être réparé. 
- L'atelier `Montage` utilise une :
  - une clé à molette taille 35mm acheté 17€
  - un lubrifiant WD40 acheté 10€
- L'atelier `Lustrage` utilise : 
  - un tampon de polissage 3m acheté 40€
  - un lubrifiant WD40 acheté 9.5€

</details>


### MCD

![mcd](https://user-images.githubusercontent.com/98805541/262282980-06cff865-8dfd-4acc-9499-807b4157d429.png)


<details><summary>
Notes et explications
</summary>

- Les **entités** sont : `Robot`, `Atelier`, `Outil`. 
  - on les note généralement au singulier et en français.

- Les **attributs** d'un robot sont : `reference`, `nom d'usage`, `date de fabrication`
  - on les note également en français.

- Les **discriminants** (ou **identifiant**) sont soulignés. 
  - ils caractérisent de manière unique une entité. À noter ici :
    - l'énoncé ne fournit pas de discriminant pour un `outil` (car on peut avoir 2 lubrifiants WD40 qui ont certes la même référence, mais un pour chaque atelier). On doit donc rajouter un déterminant artificiellement : `code outil`.
    - de même, **il arrive régulièrement d'ajouter artificiellement un `code robot` et `code atelier` comme discriminent pour les autres tables, par cohérence et simplification.**

- Les **associations** et leurs **cardinalités** sont notées entre deux entités.
  - les cardinalités précisent la nature de l'association. Il existe 3 types d'associations : 
    - `One-to-One`
    - `One-to-Many`
    - `Many-to-Many`
  - les cardinalités possibles, de part et d'autres de l'association, possibles sont : 
    - `(0,1)` : _un chimiste a entre 0 et 1 élève_
    - `(0,N)` : _un chimiste a entre 0 et N élèves_
    - `(1,1)` : _un chimiste a 1 et 1 seul élève_
    - `(1,N)` : _un chimiste a au moins 1 élève_ (cette cardinalité est plus rarement croisée en pratique).

</details>

<details><summary>
Lecture des associations et cardinalités
</summary>

```
ROBOT ---0,N--- [Maintient] ---0,N--- ATELIER
           ^^^                    ^^^
            ici, max(0,N) = N      ici, max(0,N) = N     --> C'est donc une relation N-N : Many-To-Many

Lecture de droite à gauche : "un atelier maintient entre 0 et N robots".
Lecture de gauche à droite : "un robot est maintenu par entre 0 et N ateliers".
```
  
  
```
ATELIER ---0,N--- [Appartient] ---1,1--- OUTIL
           ^^^                    ^^^
            ici, max(0,N) = N      ici, max(1,1) = 1     --> C'est donc une relation 1-N : One-To-Many

Lecture de droite à gauche : "un outil appartient à 1 et 1 seul atelier".
Lecture de gauche à droite : "un atelier possède entre 0 et N outils".
```
  
</details>


<details><summary>
Avertissements et ouverture
</summary>
  
Le MCD est un exercice "académico-franco-français". Il faut donc être rigoureux sur :
- son vocabulaire (`entité`, `attributs`, `discriminants`, `association`, `cardinalité`)
- ce qui y figure et comment (`rectangle` pour les entités, `rond` pour les associations, cardinalités de part et d'autre de l'association...)
- ce qui n'y figure pas (pas d'`ID`, pas de `clé étrangère`, pas de `tables de liaison`, pas de `type` de données, pas d'éléments spécifiques à un système de gestion de base de données...)


</details>

### MLD

[Version schématique]

![mld drawio](https://user-images.githubusercontent.com/98805541/262290690-3cb3dd02-390c-488d-8f48-b6af50cbd18f.png)


[Version texte]

```
robot ( __reference__, name, manufacturing_date )

workshop ( __name__, section, color )

tool ( __id__, name, reference, price, workshop_name #FK(workshop.name) )

robot_workshop_assignation ( __id__, robot_reference #FK(robot.reference), workshop_name #FK(workshop.name) )
```


<details><summary>
Notes et explications
</summary>

- Le MLD est un exercice moins académique.
  - une version textuelle ou graphique fera très bien l'affaire.
  - il n'y a pas de conventions strictes sur la représentation des clés primaires et étrangères. 
  - le MLD n'étant pas spécifique à un SGBD particulier, on ne précise normalement pas les types de données (`TEXT`, `DATE`, `INTEGER`...). Mais il arrive de les croiser sur certains MLD : restez ouvert donc !

- Le MLD est un exercice de traduction : 
  - on passe les champs en `anglais`, `snake_case`, tels qu'ils le seront en base de données.
  - les entités deviennent des `tables`
  - les attributs deviennent des `champs` (ou `colonnes`)
  - le discriminant (`code entité`) se traduit généralement par un simple `id` dans la table en question
  - les cardinalités se traduisent :
    - par des `clés étrangères` (d'une table) qui pointent vers la clé étrangère (d'une autre table)
    - et/ou par des `tables de liaison`, via le même méchanisme, détaillé ensuite.
  
</details>

<details><summary>
Règles de traduction des associations
</summary>

Selon le type d'association, il **suffit** de traduire de la manière suivante.
- `One-To-One` : **il suffit d'ajouter un champ sur une des deux tables**.
  - note : il est rare de devoir traduire une association One-To-One, car on modélise généralement et directement par un attribut (scalaire) dans le MCD.

- `One-To-Many` : **il suffit d'ajouter une clé étrangère qui pointe vers la clé primaire de l'autre table**.
  - note : on rajoute la clé étrangère côté où la cardinalité max vaut 1.
  - exemple : _un chat appartient a 1 et 1 seul chenil, chenil qui accueille entre 0 et N chats_, on rajoute donc un `kennel_id` sur la table des `cat`, qui pointe vers le champ `id` de la table `kennel`.
  
- `Many-To-Many` : **il suffit d'ajouter une table de liaison qui porte 2 clés étrangères vers les tables initiales**.
  - note : il faut donner un nom explicite à la table de liaison pour faciliter la maintenance du système.
  - exemple : _un élève peut avoir plusieurs profs, un prof peut avoir plusieurs élèves_ , on créé donc la table `affectation` (ou simplement `teacher_has_student`) de la manière suivante : `affectectation : id, student_id, teacher_id`
  
</details>
  
<details><summary>
Explications des autres champs
</summary>

```
robot (
  __reference__,            --> On souligne la clé primaire de chaque table. 
  name,                     --> On traduit en anglais les attributs
  manufacturing_date        --> On ne précise pas les types de données, c'est pour la prochaine étape
)

workshop (                  --> On traduit en anglais les tables
  __name__,                 --> Si on avait rajouté un "code atelier" dans le MCD, on aurait plutôt un __id__ comme clé primaire ici aussi. On voit cette approche très régulièrement !
  section,
  color (hexadecimal code)  --> On peut se permettre d'ajouter des commentaires si besoin
)

tool (
  __id__,
  name,
  reference,
  price,
  workshop_name #FK(workshop.name)                --> On précise les clés étrangères et vers quelle table elles pointent. Ici, le champ `workshop_name` pointe vers le champ `name` (clé primaire) de la table `workshop`.
)
  
robot_workshop_assignation (                      --> On créé des tables de laisons
  __id__,                                         --> On pourrait ne pas ajouter cet ID et utiliser une "clé primaire composite" en soulignant les deux autres attributs.
  robot_reference #FK(robot.reference),           --> Avec deux clés étrangères...
  workshop_name #FK(workshop.name)                --> ...une pour chaque table
)
```
  
</details>


### MPD

On choisit le SGBD qui va accueillir les données, par exemple `PostgreSQL`, et on traduit techniquement le MLD.

```sql
CREATE TABLE robot (
  reference TEXT PRIMARY KEY,
  name TEXT,
  manufactoring_date DATE
);

CREATE TABLE workshop (
  name TEXT PRIMARY KEY,
  section TEXT,
  color VARCHAR(7)
);

CREATE TABLE tool (
  id INT PRIMARY KEY,
  name TEXT,
  reference TEXT,
  price DECIMAL,
  workshop_name TEXT REFERENCES workshop(name) -- Clé étrangère : assure la cohérence et l'intégrité de la BDD. On ne peut pas insérer un workshop_name qui n'existe pas dans la table workshop
);

CREATE TABLE robot_workshop_assignation (
  id INT PRIMARY KEY,
  robot_reference TEXT REFERENCES robot(reference),
  workshop_name TEXT REFERENCES workshop(name)
);
```

<details><summary>
Format alternatif (sans script)
</summary>
  
On peut très bien exposer le MPD sans pour autant écrire le script SQL, par exemple. Mais c'est plus fastidieux.

**[Robot]**

| Champ | type | clé primaire | contraintes | notes  |
| -- | -- | -- | -- | -- |
| reference | TEXT | ✅ | unique | la référence unique d'un robot |
| name | TEXT | | | le surnom donné par l'entreprise au robot |
| manufactoring_date | DATE |  | | la date de fabrication du robot |
  

</details>


## Modélisation alternative (avec `id`)

Il arrive très régulièrement **d'ajouter, pour toutes les entités/tables, des `code entité` (MCD), qui se traduisent en `id` (MLD)**, pour toutes les entités/tables, par cohérence et simplicité. C'est peut-être l'approche la plus courante.

<details><summary>
MCD & MLD
</summary>

| **MCD** | **MLD** |
| -- | -- |
| ![mcd-v2](https://user-images.githubusercontent.com/98805541/262296123-e5565030-4daa-4691-8002-582bd5b4ccb9.png) | ![mld-v2](https://user-images.githubusercontent.com/98805541/262296128-88b58f61-385d-40a2-be63-594c0ff31526.png) | 
  
</details>



<details><summary>
MPD (et quelques bonus)
</summary>

```sql
CREATE TABLE robot (
  id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  manufactoring_date DATE NOT NULL
);

CREATE TABLE workshop (
  id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  section TEXT,
  color VARCHAR(7)
);

CREATE TABLE tool (
  id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  reference TEXT NOT NULL,
  price DECIMAL,
  workshop_id INT REFERENCES workshop(id)
);

CREATE TABLE robot_workshop_assignation (
  id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,  -- On aurait pu également choisir une clé primaire composite plutôt qu'un id plus haut
  robot_id INT REFERENCES robot(id),
  workshop_id INT REFERENCES workshop(id),
  UNIQUE (robot_id, workshop_id)   -- Contrainte d'unicité sur deux champs.
);
```
  
</details>
