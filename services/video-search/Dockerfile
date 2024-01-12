FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN apk add --no-cache libc6-compat

FROM base as deps
COPY package-lock.json /usr/src/app/package-lock.json
COPY ./services/video-search/package.json /usr/src/app/package.json
RUN npm install

FROM base as dev
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY ./services/video-search /usr/src/app

FROM base as builder
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY ./services/video-search /usr/src/app
RUN npm run build

FROM base as prod-dependencies
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 videosearch

COPY --from=deps --chown=videosearch:nodejs /usr/src/app/package-lock.json ./package-lock.json
COPY --from=builder --chown=videosearch:nodejs /usr/src/app/dist /usr/src/app/package.json ./

RUN npm install --omit=dev

FROM prod-dependencies as runner
ENV NODE_ENV production

USER videosearch
ENV PORT 8000

EXPOSE ${PORT}

# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "index.js"]
