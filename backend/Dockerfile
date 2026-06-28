FROM oven/bun:1

WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

COPY package.json bun.lockb* ./

RUN bun install

COPY . .

EXPOSE 4000

CMD ["bun", "run", "dev"]