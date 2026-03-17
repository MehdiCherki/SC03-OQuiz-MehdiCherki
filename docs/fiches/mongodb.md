# 📘 MongoDB

---

## 1. Qu'est-ce que MongoDB ?

MongoDB est un **système de gestion de base de données NoSQL** orienté **documents**. Les données sont stockées au format **BSON** (Binary JSON), dans des structures flexibles appelées _documents_, regroupées dans des _collections_.

```
SGBDR             ↔   MongoDB
Base de données   ↔   Database
Table             ↔   Collection
Ligne / Enregistrement ↔   Document (BSON/JSON)
Colonne           ↔   Champ (field)
Jointure (JOIN)   ↔   $lookup / dénormalisation
```

---

## 2. MongoDB vs Base de données relationnelle

### ✅ Avantages de MongoDB

| Critère                     | MongoDB                                                                  |
| --------------------------- | ------------------------------------------------------------------------ |
| **Schéma flexible**         | Pas de schéma fixe : chaque document peut avoir une structure différente |
| **Scalabilité horizontale** | Sharding natif : distribution des données sur plusieurs serveurs         |
| **Performance en lecture**  | Données liées stockées ensemble → moins de jointures coûteuses           |
| **Développement agile**     | Le modèle évolue sans migration lourde                                   |
| **Format naturel**          | BSON ≈ JSON → intégration directe avec les applications web/Node.js      |
| **Haute disponibilité**     | Réplication native via _replica sets_                                    |
| **Données hiérarchiques**   | Documents imbriqués pour représenter des structures complexes            |

### ❌ Inconvénients de MongoDB (vs SGBDR)

| Critère                       | Limite MongoDB                                                      |
| ----------------------------- | ------------------------------------------------------------------- |
| **Transactions complexes**    | Support ACID multi-documents depuis v4.0, mais plus lourd qu'en SQL |
| **Pas de jointures natives**  | `$lookup` existe mais moins performant qu'un JOIN bien indexé       |
| **Redondance des données**    | La dénormalisation duplique des données → risque d'incohérence      |
| **Consommation mémoire**      | BSON + noms de champs répétés dans chaque document                  |
| **Maturité outillage**        | BI, reporting, ORM moins matures qu'en SQL                          |
| **Requêtes ad hoc complexes** | SQL reste plus expressif pour certaines analyses                    |
| **Compétences**               | Moins répandu que SQL dans les équipes                              |

> **Quand choisir MongoDB ?** Données hétérogènes, fort volume, besoins de scalabilité, documents JSON naturels (catalogues, logs, contenus, événements).
>
> **Quand choisir un SGBDR ?** Relations complexes entre entités, intégrité forte, transactions financières, reporting métier avancé.

---

## 3. Commandes principales

### 3.1 Gestion des bases et collections

```javascript
// Afficher les bases disponibles
show dbs

// Sélectionner / créer une base
use maBase

// Afficher la base courante
db

// Lister les collections
show collections

// Créer une collection explicitement
db.createCollection("users")

// Supprimer une collection
db.users.drop()

// Supprimer la base courante
db.dropDatabase()
```

---

### 3.2 Insertion de documents

```javascript
// Insérer un document
db.users.insertOne({
  nom: "Dupont",
  prenom: "Alice",
  age: 32,
  roles: ["admin", "editor"],
});

// Insérer plusieurs documents
db.users.insertMany([
  { nom: "Martin", prenom: "Bob", age: 25 },
  { nom: "Petit", prenom: "Clara", age: 29, actif: true },
]);
```

---

### 3.3 Requêtes de lecture

```javascript
// Tous les documents
db.users.find();

// Avec filtre
db.users.find({ age: { $gte: 30 } });

// Un seul document
db.users.findOne({ nom: "Dupont" });

// Projection (inclure/exclure des champs)
db.users.find({}, { nom: 1, prenom: 1, _id: 0 });

// Tri, limite, saut
db.users.find().sort({ age: -1 }).limit(5).skip(10);

// Comptage
db.users.countDocuments({ actif: true });
```

#### Opérateurs de comparaison courants

| Opérateur      | Signification                           |
| -------------- | --------------------------------------- |
| `$eq`          | Égal                                    |
| `$ne`          | Différent                               |
| `$gt` / `$gte` | Supérieur / supérieur ou égal           |
| `$lt` / `$lte` | Inférieur / inférieur ou égal           |
| `$in`          | Dans un tableau de valeurs              |
| `$nin`         | Pas dans un tableau                     |
| `$exists`      | Le champ existe                         |
| `$regex`       | Correspondance par expression régulière |

```javascript
// Exemple combiné
db.users.find({
  age: { $gte: 18, $lt: 40 },
  roles: { $in: ["admin"] },
  email: { $exists: true },
});
```

---

### 3.4 Mise à jour

```javascript
// Modifier un champ (updateOne)
db.users.updateOne({ nom: "Dupont" }, { $set: { age: 33 } });

// Modifier plusieurs documents
db.users.updateMany({ actif: { $exists: false } }, { $set: { actif: false } });

// Incrémenter une valeur
db.users.updateOne({ nom: "Dupont" }, { $inc: { age: 1 } });

// Ajouter un élément à un tableau
db.users.updateOne({ nom: "Dupont" }, { $push: { roles: "viewer" } });

// Supprimer un champ
db.users.updateOne({ nom: "Dupont" }, { $unset: { ancienChamp: "" } });

// Remplacer entièrement un document
db.users.replaceOne({ nom: "Dupont" }, { nom: "Dupont", age: 34 });
```

#### Opérateurs de mise à jour courants

| Opérateur   | Effet                               |
| ----------- | ----------------------------------- |
| `$set`      | Définit ou modifie un champ         |
| `$unset`    | Supprime un champ                   |
| `$inc`      | Incrémente une valeur numérique     |
| `$push`     | Ajoute un élément à un tableau      |
| `$pull`     | Retire un élément d'un tableau      |
| `$addToSet` | Ajoute sans doublon dans un tableau |
| `$rename`   | Renomme un champ                    |

---

### 3.5 Suppression

```javascript
// Supprimer un document
db.users.deleteOne({ nom: "Dupont" });

// Supprimer plusieurs documents
db.users.deleteMany({ actif: false });

// Supprimer tous les documents d'une collection
db.users.deleteMany({});
```

---

### 3.6 Index

```javascript
// Créer un index simple
db.users.createIndex({ nom: 1 });

// Index unique
db.users.createIndex({ email: 1 }, { unique: true });

// Index composé
db.users.createIndex({ nom: 1, age: -1 });

// Index texte (full-text search)
db.articles.createIndex({ contenu: "text" });

// Lister les index
db.users.getIndexes();

// Supprimer un index
db.users.dropIndex("nom_1");
```

---

## 4. Le pipeline `aggregate`

La fonction `aggregate` est le moteur d'**analyse et de transformation** de MongoDB. Elle traite les documents à travers une **série d'étapes** (pipeline), chacune transformant le résultat de la précédente.

```javascript
db.collection.aggregate([ étape1, étape2, ... ])
```

---

### 4.1 Étapes principales du pipeline

#### `$match` — Filtrer les documents

Équivalent du `WHERE` en SQL. **À placer en premier** pour optimiser les performances.

```javascript
{ $match: { age: { $gte: 18 }, actif: true } }
```

---

#### `$group` — Regrouper et agréger

Équivalent du `GROUP BY`. Le champ `_id` définit le critère de regroupement.

```javascript
{
  $group: {
    _id: "$ville",
    totalUsers: { $sum: 1 },
    ageMoyen: { $avg: "$age" },
    ageMax: { $max: "$age" },
    ageMin: { $min: "$age" }
  }
}
```

| Accumulateur       | Rôle                                         |
| ------------------ | -------------------------------------------- |
| `$sum`             | Somme (ou `$sum: 1` pour compter)            |
| `$avg`             | Moyenne                                      |
| `$min` / `$max`    | Valeur min / max                             |
| `$first` / `$last` | Premier / dernier élément du groupe          |
| `$push`            | Construit un tableau avec toutes les valeurs |
| `$addToSet`        | Tableau sans doublons                        |

---

#### `$project` — Sélectionner / transformer les champs

Équivalent du `SELECT`. Permet de renommer, calculer, inclure ou exclure des champs.

```javascript
{
  $project: {
    _id: 0,
    nomComplet: { $concat: ["$prenom", " ", "$nom"] },
    anneeNaissance: { $subtract: [2025, "$age"] }
  }
}
```

---

#### `$sort` — Trier

```javascript
{
  $sort: {
    ageMoyen: -1;
  }
} // -1 = décroissant, 1 = croissant
```

---

#### `$limit` et `$skip` — Paginer

```javascript
{ $skip: 20 },
{ $limit: 10 }
```

---

#### `$unwind` — Décomposer un tableau

Crée un document par élément d'un tableau. Utile avant un `$group` sur des sous-éléments.

```javascript
// Document source : { tags: ["mongodb", "nosql", "dev"] }
{
  $unwind: "$tags";
}
// → 3 documents distincts avec un seul tag chacun
```

---

#### `$lookup` — Jointure entre collections

Équivalent d'un `LEFT JOIN`.

```javascript
{
  $lookup: {
    from: "commandes",          // collection cible
    localField: "userId",       // champ local
    foreignField: "clientId",   // champ distant
    as: "mesCommandes"          // nom du tableau résultant
  }
}
```

---

#### `$addFields` — Ajouter des champs calculés

```javascript
{
  $addFields: {
    estMajeur: { $gte: ["$age", 18] },
    nomComplet: { $concat: ["$prenom", " ", "$nom"] }
  }
}
```

---

#### `$count` — Compter les documents en sortie

```javascript
{
  $count: "totalResultats";
}
```

---

#### `$facet` — Pipelines multiples en parallèle

Permet d'exécuter plusieurs sous-pipelines sur les mêmes données.

```javascript
{
  $facet: {
    parVille: [
      { $group: { _id: "$ville", total: { $sum: 1 } } }
    ],
    parAge: [
      { $bucket: { groupBy: "$age", boundaries: [0, 18, 30, 50, 100], default: "Autre" } }
    ]
  }
}
```

---

### 4.2 Exemple complet de pipeline

**Contexte :** Collection `orders` avec les champs `clientId`, `montant`, `statut`, `date`.

**Objectif :** Top 5 des clients avec le plus grand total de commandes "validées" en 2024.

```javascript
db.orders.aggregate([
  // 1. Filtrer les commandes validées en 2024
  {
    $match: {
      statut: "validee",
      date: {
        $gte: ISODate("2024-01-01"),
        $lt: ISODate("2025-01-01"),
      },
    },
  },

  // 2. Regrouper par client et sommer les montants
  {
    $group: {
      _id: "$clientId",
      totalAchats: { $sum: "$montant" },
      nbCommandes: { $sum: 1 },
    },
  },

  // 3. Jointure avec la collection clients
  {
    $lookup: {
      from: "clients",
      localField: "_id",
      foreignField: "_id",
      as: "infoClient",
    },
  },

  // 4. Décomposer le tableau infoClient
  { $unwind: "$infoClient" },

  // 5. Projeter les champs utiles
  {
    $project: {
      _id: 0,
      nom: "$infoClient.nom",
      totalAchats: 1,
      nbCommandes: 1,
    },
  },

  // 6. Trier par total décroissant
  { $sort: { totalAchats: -1 } },

  // 7. Garder le top 5
  { $limit: 5 },
]);
```

---

## 5. Résumé visuel des étapes du pipeline

```
Documents bruts
      │
   $match          ← Filtrer (WHERE)
      │
   $unwind         ← Éclater les tableaux
      │
   $group          ← Agréger (GROUP BY)
      │
   $lookup         ← Jointure (LEFT JOIN)
      │
   $addFields      ← Champs calculés
      │
   $project        ← Sélection/renommage (SELECT)
      │
   $sort           ← Trier (ORDER BY)
      │
   $skip / $limit  ← Pagination
      │
  Résultat final
```

---

## 6. Ressources complémentaires

- [Documentation officielle MongoDB](https://www.mongodb.com/docs/)
- [MongoDB University (cours gratuits)](https://learn.mongodb.com/)
- [Playground en ligne](https://mongoplayground.net/)
- Commande utile : `db.collection.explain("executionStats").aggregate([...])` pour analyser les performances d'un pipeline
