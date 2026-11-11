FROM node:24-alpine

ARG USER_ID=1000
ARG GROUP_ID=1000

# Aligne l'utilisateur "node" sur l'utilisateur hôte
RUN apk add --no-cache shadow \
    && groupmod -o -g ${GROUP_ID} node \
    && usermod -o -u ${USER_ID} -g ${GROUP_ID} node \
    && mkdir -p /app && chown node:node /app

USER node
WORKDIR /app

EXPOSE 5173
# Attend la fin de task install (npm install + routes JS) avant de lancer Vite, qui planterait sinon.
CMD ["sh", "-c", "until [ -f node_modules/.package-lock.json ] && [ -f var/routes/index.js ]; do echo 'En attente de task install…'; sleep 2; done; npm run dev"]
