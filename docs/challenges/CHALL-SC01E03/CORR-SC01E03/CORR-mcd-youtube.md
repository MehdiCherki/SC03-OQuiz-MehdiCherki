PLAYLIST: code playlist, titre, description, visibilité, date de creation, date de modification
CONTENIR, 0N PLAYLIST , 0N VIDEO
VIDEO: code vidéo, titre, description, vidéo url, miniature url, date de publication, date de modification
TAGUER, 0N VIDEO, 0N TAG
TAG: code tag, nom

CREER, 0N UTILISATEUR , 11 PLAYLIST
REGARDER, 0N UTILISATEUR , 0N VIDEO: date visionnage
AIMER, 0N UTILISATEUR , VIDEO: date d'ajout
PUBLIER, 0N UTILISATEUR, 11 VIDEO
COMMENTER, 11 COMMENTAIRE , 0N VIDEO

:
S'ABONNER, 0N [abonné] UTILISATEUR , [chaine] UTILISATEUR
UTILISATEUR: code utilisateur, pseudo, email, mot de passe, avatar url, bio, date d'inscription
COMMENTE, 11 COMMENTAIRE, 0N UTILISATEUR
COMMENTAIRE: code commentaire, contenu, date
:

:
RECHERCHE: requête
RECHERCHER, 0N UTILISATEUR , 11 RECHERCHE
:
REPONDRE, 01 [commentaire parent] COMMENTAIRE , 0N [commentaire enfant] COMMENTAIRE