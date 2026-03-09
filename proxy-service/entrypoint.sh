#!/bin/sh

# Copie le contenu de `oquiz.template.conf`` dans `oquiz.conf`
# tout en remplaçant le contenu des variables d'environnement présents en dur !
envsubst '${CLIENT_SERVER_NAME} ${API_SERVER_NAME}' < /etc/nginx/conf.d/oquiz.template.conf > /etc/nginx/conf.d/oquiz.conf

# Supprimer la config par défaut de nginx
rm /etc/nginx/conf.d/default.conf

# Démarrer NGINX manuellement en tâche de fond
# (puisqu'on écrase le entrypoint par défaut, il faut alors le faire soit même)
nginx -g 'daemon off;'
