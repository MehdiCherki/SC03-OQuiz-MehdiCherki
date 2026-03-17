# Cheat sheet PostgreSQL

## Se connecter à Postgres comme "super user" via `psql` (depuis `bash`)

`sudo -i -u postgres psql`

## Se connecter à une base X comme utilisateur Y

`psql -U nom_utilisateur -d nom_base -h localhost`

## Créer un utilisateur Postgres

- `CREATE ROLE mon_user WITH LOGIN PASSWORD 'mon_P4$$word';`
- (alternativement) `CREATE USER mon_user WITH PASSWORD 'mon_P4$$word';` 

## Créer une base de données

- `CREATE DATABASE ma_base WITH OWNER mon_owner;`

## Supprimer une base de données et son propriétaire

- `DROP DATABASE ma_base;`
- `DROP ROLE mon_user;`

## Commandes utiles

- `\conninfo` : précise sur quelle BDD et avec quel utilisateur on est connecté à son serveur Postgres.

- `\l` : liste toutes les BDD présentes dans son serveur Postgres.
- `\du` : liste tous les utilisateurs présents dans son serveur Postgres.

- `\c nom_base nom_utilisateur` : pour se connecter à la base nom_base avec l'utilisateur nom_utilisateur.
- `\dt` : liste les tables de la BDD dans laquelle on est connecté.

## Exécuter un script SQL

- Depuis `bash` : 
  - `psql -U mon_user -d ma_base -f chemin_relatif_ou_absolu_vers_le_fichier.sql`
- Depuis `psql` : 
  - S'assurer avant tout d'être dans la bonne base : `\conninfo`
  - Exécuter le script : `\i chemin_absolu_vers_le_fichier`
