FROM node:22-slim

ARG CODEX_NPM_PACKAGE=@openai/codex
ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm config set registry "${NPM_CONFIG_REGISTRY}" \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm config set fetch-timeout 300000 \
  && npm ci --include=dev --verbose
RUN npm config set registry "${NPM_CONFIG_REGISTRY}" \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm config set fetch-timeout 300000 \
  && npm install -g ${CODEX_NPM_PACKAGE} --verbose

COPY . .

RUN mkdir -p /workspace /sessions /ipc /memory/global /memory/group /root/.codex /app/test-bin
RUN chmod +x /app/container/test-bin/fake-codex

CMD ["sleep", "infinity"]
