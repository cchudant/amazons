FROM node:14

WORKDIR /app

COPY ./front/package.json ./front/package.json
COPY ./front/yarn.lock ./front/yarn.lock

COPY ./front/public ./front/public
COPY ./front/src ./front/src
COPY ./front/config-overrides.js ./front/config-overrides.js
COPY ./front/tsconfig.json ./front/tsconfig.json

RUN yarn --cwd ./front install --frozen-lockfile
RUN yarn --cwd ./front build

RUN rm -rf node_modules
RUN yarn global add serve

RUN rm -rf ./front/package.json
RUN rm -rf ./front/public
RUN rm -rf ./front/src
RUN rm -rf ./front/config-overrides.js
RUN rm -rf ./front/tsconfig.json

WORKDIR /app/front

CMD bash -c "serve -s dist -l 8080"