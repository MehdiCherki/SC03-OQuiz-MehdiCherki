# Logs Service

## Démarrer la BDD mongodb avec docker

```bash
docker run -d --name ${containerName} -p ${port}:27017 --rm mongo:${mongoVersion}

docker run -d --name log_db -p 27018:27017 --rm mongo:latest
```
