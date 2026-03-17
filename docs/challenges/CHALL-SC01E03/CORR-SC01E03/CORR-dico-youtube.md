# Dictionnaire de Données – YouTube (PostgreSQL)


## Table : user

| Nom         | Type      | Clé   | NON NULL ? | UNIQUE ? | Description              |
|--------------|-----------|-------|------------|----------|--------------------------|
| id           | SERIAL    | PK    | ✅         | ✅       | Identifiant unique       |
| username     | TEXT      |       | ✅         | ✅       | Nom d’utilisateur        |
| email        | TEXT      |       | ✅         | ✅       | Adresse email            |
| password     | TEXT      |       | ✅         | ❌       | Mot de passe haché       |
| avatar_url   | TEXT      |       | ❌         | ❌       | URL de l’avatar          |
| bio          | TEXT      |       | ❌         | ❌       | Biographie               |
| created_at   | TIMESTAMP |       | ✅         | ❌       | Date de création         |
| updated_at   | TIMESTAMP |       | ✅         | ❌       | Date de mise à jour      |

---

## Table : video

| Nom            | Type      | Clé   | NON NULL ? | UNIQUE ? | Description              |
|----------------|-----------|-------|------------|----------|--------------------------|
| id             | SERIAL    | PK    | ✅         | ✅       | Identifiant unique       |
| title          | TEXT      |       | ✅         | ❌       | Titre de la vidéo        |
| description    | TEXT      |       | ❌         | ❌       | Description de la vidéo  |
| media_url      | TEXT      |       | ✅         | ✅       | URL du fichier vidéo     |
| thumbnail_url  | TEXT      |       | ❌         | ❌       | URL de la miniature      |
| author_id      | INTEGER   | FK    | ✅         | ❌       | Auteur de la vidéo       |
| created_at     | TIMESTAMP |       | ✅         | ❌       | Date de création         |
| updated_at     | TIMESTAMP |       | ✅         | ❌       | Date de mise à jour      |

---

## Table : playlist

| Nom         | Type      | Clé   | NON NULL ? | UNIQUE ? | Description                  |
|-------------|-----------|-------|------------|----------|------------------------------|
| id          | SERIAL    | PK    | ✅         | ✅       | Identifiant unique           |
| title       | TEXT      |       | ✅         | ❌       | Titre de la playlist         |
| description | TEXT      |       | ❌         | ❌       | Description de la playlist   |
| is_public   | BOOLEAN   |       | ✅         | ❌       | Visibilité (true/false)      |
| user_id     | INTEGER   | FK    | ✅         | ❌       | Propriétaire de la playlist  |
| created_at  | TIMESTAMP |       | ✅         | ❌       | Date de création             |
| updated_at  | TIMESTAMP |       | ✅         | ❌       | Date de mise à jour          |

---

## Table : comment

| Nom               | Type      | Clé   | NON NULL ? | UNIQUE ? | Description                            |
|-------------------|-----------|-------|------------|----------|----------------------------------------|
| id                | SERIAL    | PK    | ✅         | ✅       | Identifiant du commentaire             |
| content           | TEXT      |       | ✅         | ❌       | Contenu du commentaire                 |
| video_id          | INTEGER   | FK    | ✅         | ❌       | Vidéo concernée                        |
| author_id         | INTEGER   | FK    | ✅         | ❌       | Auteur du commentaire                  |
| parent_comment_id | INTEGER   | FK    | ❌         | ❌       | Réponse à un autre commentaire         |
| created_at        | TIMESTAMP |       | ✅         | ❌       | Date de création                       |
| updated_at        | TIMESTAMP |       | ✅         | ❌       | Date de mise à jour                    |

---

## Table : tag

| Nom        | Type      | Clé   | NON NULL ? | UNIQUE ? | Description          |
|------------|-----------|-------|------------|----------|----------------------|
| id         | SERIAL    | PK    | ✅         | ✅       | Identifiant unique   |
| name       | TEXT      |       | ✅         | ✅       | Nom du tag           |
| created_at | TIMESTAMP |       | ✅         | ❌       | Date de création     |
| updated_at | TIMESTAMP |       | ✅         | ❌       | Date de mise à jour  |

---

## Table : search

| Nom        | Type      | Clé   | NON NULL ? | UNIQUE ? | Description                     |
|------------|-----------|-------|------------|----------|---------------------------------|
| id         | SERIAL    | PK    | ✅         | ✅       | Identifiant                     |
| query      | TEXT      |       | ✅         | ❌       | Requête de recherche            |
| created_at | TIMESTAMP |       | ✅         | ❌       | Date de la recherche effectuée  |

---

## Table : video_playlist

| Nom         | Type    | Clé                  | NON NULL ? | UNIQUE ? | Description                  |
|-------------|---------|----------------------|------------|----------|------------------------------|
| video_id    | INTEGER | PK composite, FK     | ✅         | ❌       | Vidéo associée               |
| playlist_id | INTEGER | PK composite, FK     | ✅         | ❌       | Playlist associée            |
| created_at  | TIMESTAMP |                    | ✅         | ❌       | Date d’ajout dans la playlist |

---

## Table : video_tag

| Nom        | Type    | Clé                  | NON NULL ? | UNIQUE ? | Description               |
|------------|---------|----------------------|------------|----------|---------------------------|
| video_id   | INTEGER | PK composite, FK     | ✅         | ❌       | Vidéo associée            |
| tag_id     | INTEGER | PK composite, FK     | ✅         | ❌       | Tag associé               |
| created_at | TIMESTAMP |                    | ✅         | ❌       | Date d’ajout du tag       |

---

## Table : subscription

| Nom         | Type    | Clé                  | NON NULL ? | UNIQUE ? | Description                 |
|-------------|---------|----------------------|------------|----------|-----------------------------|
| follower_id | INTEGER | PK composite, FK     | ✅         | ❌       | L’abonné                    |
| followed_id | INTEGER | PK composite, FK     | ✅         | ❌       | L’utilisateur suivi         |
| created_at  | TIMESTAMP |                    | ✅         | ❌       | Date du suivi               |

---

## Table : view

| Nom        | Type    | Clé       | NON NULL ? | UNIQUE ? | Description                       |
|------------|---------|-----------|------------|----------|-----------------------------------|
| id         | SERIAL  | PK        | ✅         | ✅       | Identifiant                       |
| video_id   | INTEGER | FK        | ✅         | ❌       | Vidéo vue                         |
| viewer_id  | INTEGER | FK        | ✅         | ❌       | Utilisateur ayant vu la vidéo     |
| created_at | TIMESTAMP |         | ✅         | ❌       | Date du visionnage                |

---

## Table : like

| Nom        | Type    | Clé                  | NON NULL ? | UNIQUE ? | Description               |
|------------|---------|----------------------|------------|----------|---------------------------|
| video_id   | INTEGER | PK composite, FK     | ✅         | ❌       | Vidéo aimée               |
| viewer_id  | INTEGER | PK composite, FK     | ✅         | ❌       | Utilisateur ayant aimé    |
| created_at | TIMESTAMP |                    | ✅         | ❌       | Date du like              |
| updated_at | TIMESTAMP |                    | ✅         | ❌       | Date de mise à jour       |
