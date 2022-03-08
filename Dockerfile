FROM node:lts as build

COPY ./ /app/
WORKDIR /app

RUN echo JWT_SECRET=$JWT_SECRET > .env
RUN echo CONNECTION_STRING=$CONNECTION_STRING >> .env

RUN npm install
RUN npm run build

FROM node:lts as deploy

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
WORKDIR /app

EXPOSE 3000
ENV PORT 3000

CMD ["node", "dist/index.js"]