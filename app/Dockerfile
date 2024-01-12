FROM node:20-bullseye-slim AS base
WORKDIR /usr/src/app

FROM base as deps

COPY ./app/package.json /usr/src/app
COPY ./package-lock.json /usr/src/app
RUN npm install

FROM base as dev
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY ./app /usr/src/app

FROM base as builder
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY ./app /usr/src/app
RUN npm run build

FROM base as runner
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs


RUN mkdir .next \
    && chown -R nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static

USER nextjs

ENV PORT 3000

EXPOSE ${PORT}

# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

