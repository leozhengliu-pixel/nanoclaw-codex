FROM node:22-slim

ARG CODEX_NPM_PACKAGE=@openai/codex

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev
RUN npm install -g ${CODEX_NPM_PACKAGE}

COPY . .

RUN mkdir -p /workspace /sessions /ipc /memory/global /memory/group /root/.codex /app/test-bin
RUN chmod +x /app/container/test-bin/fake-codex

CMD ["sleep", "infinity"]
